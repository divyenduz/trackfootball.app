import * as trpc from '@trpc/server'

import { MESSAGE_UNAUTHORIZED } from '../../../../packages/auth/utils'
import { Context } from '../[trpc]'

export const integrationStravaDisconnectRouter = trpc
  .router<Context>()
  .mutation('integration.strava.disconnect', {
    async resolve({ ctx }) {
      if (!ctx.user) {
        throw new Error(MESSAGE_UNAUTHORIZED)
      }
      const stravaLogin = ctx.user.socialLogin.find(
        (sl) => sl.platform === 'STRAVA'
      )
      if (!Boolean(stravaLogin)) {
        throw new Error(
          "Trying to disconnect Strava login but it doesn't exist"
        )
      }
      await ctx.sql`
      DELETE FROM "SocialLogin"
      WHERE "id" = ${stravaLogin!.id}
      `
      return true
    },
  })
