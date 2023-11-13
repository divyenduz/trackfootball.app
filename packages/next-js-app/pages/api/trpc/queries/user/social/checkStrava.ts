import * as trpc from '@trpc/server'
import { match } from 'ts-pattern'

import { MESSAGE_UNAUTHORIZED } from '../../../../../../packages/auth/utils'
import { checkStravaAccessToken } from '../../../../../../repository/strava'
import { Context } from '../../../[trpc]'

export type CheckStravaState =
  | 'LOADING'
  | 'NOT_CONNECTED'
  | 'WORKING'
  | 'NOT_WORKING'

export const userSocialCheckStravaRouter = trpc
  .router<Context>()
  .query('user.social.checkStrava', {
    async resolve({ ctx }) {
      if (!ctx.user) {
        throw new Error(MESSAGE_UNAUTHORIZED)
      }

      const socialLogin = ctx.user?.socialLogin?.find(
        (sl) => sl.platform === 'STRAVA'
      )

      // Note: if no social login, strava is not connected
      if (!Boolean(socialLogin)) {
        return 'NOT_CONNECTED'
      }

      try {
        return (await checkStravaToken(ctx)) as CheckStravaState
      } catch (e) {
        console.error('Error: strava check failed')
        console.error(e)
        return 'NOT_WORKING' as CheckStravaState
      }
    },
  })

async function checkStravaToken(ctx: Context) {
  if (!ctx.user) {
    console.error(
      'Note: failed to get strava access token, user not found in context'
    )
    return 'NOT_WORKING'
  }
  const r = await checkStravaAccessToken(ctx.user.id)
  return match(r)
    .with(true, () => 'WORKING')
    .with(false, () => 'NOT_WORKING')
    .exhaustive()
}
