'use server'

import { sql } from '@trackfootball/database'
import { revalidatePath } from 'next/cache'
import { auth } from 'utils/auth'

export async function disconnectStrava() {
  const user = await auth()

  const stravaLogin = user.socialLogin.find((sl) => sl.platform === 'STRAVA')
  if (!Boolean(stravaLogin)) {
    throw new Error("Trying to disconnect Strava login but it doesn't exist")
  }
  await sql`
    DELETE FROM "SocialLogin"
    WHERE "id" = ${stravaLogin!.id}
  `
  revalidatePath(`/athlete/${user.id}`)
  return true
}
