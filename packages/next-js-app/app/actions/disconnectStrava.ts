'use server'

import { revalidatePath } from 'next/cache'
import { deleteSocialLoginById } from '@trackfootball/database/repository/socialLogin'
import { auth } from 'utils/auth'
import invariant from 'tiny-invariant'

export async function disconnectStrava() {
  const user = await auth()
  invariant(user, 'disconnect strava called without user')

  const stravaLogin = user.socialLogin.find((sl) => sl.platform === 'STRAVA')
  invariant(user, 'disconnect strava called without strava connection')
  await deleteSocialLoginById(stravaLogin!.id)
  revalidatePath(`/athlete/${user.id}`)
  return true
}
