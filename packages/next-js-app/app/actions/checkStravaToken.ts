'use server'

import { AwaitedUser } from 'app/layout'
import { checkStravaAccessToken } from 'repository/strava'
import { match } from 'ts-pattern'

export async function checkStravaToken(user: AwaitedUser) {
  if (!user) {
    console.error(
      'Note: failed to get strava access token, user not found in context'
    )
    return 'NOT_WORKING'
  }

  const socialLogin = user?.socialLogin?.find((sl) => sl.platform === 'STRAVA')

  // Note: if no social login, strava is not connected
  if (!Boolean(socialLogin)) {
    return 'NOT_CONNECTED'
  }

  const r = await checkStravaAccessToken(user.id)
  return match(r)
    .with(true, () => 'WORKING')
    .with(false, () => 'NOT_WORKING')
    .exhaustive()
}
