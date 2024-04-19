'use server'

import { sql } from '@trackfootball/database'
import { auth } from 'utils/auth'
import { z } from 'zod'

import { FormValidationFailedError } from './actions'

const schema = z.object({})

export async function disconnectStrava(formData: FormData) {
  const validatedFields = schema.safeParse({})

  if (!validatedFields.success) {
    throw new FormValidationFailedError(
      JSON.stringify(validatedFields.error.flatten().fieldErrors)
    )
  }

  const {} = validatedFields.data

  const user = await auth()

  const stravaLogin = user.socialLogin.find((sl) => sl.platform === 'STRAVA')
  if (!Boolean(stravaLogin)) {
    throw new Error("Trying to disconnect Strava login but it doesn't exist")
  }
  await sql`
    DELETE FROM "SocialLogin"
    WHERE "id" = ${stravaLogin!.id}
  `
  return true
}
