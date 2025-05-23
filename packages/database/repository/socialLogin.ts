import { SocialLogin } from '@prisma/client'
import { sql } from '../index'

export async function getSocialLoginsByUserId(userId: number): Promise<SocialLogin[]> {
  const socialLogins: SocialLogin[] = await sql`
  SELECT * FROM "SocialLogin"
  WHERE "SocialLogin"."userId" = ${userId}
  `
  return socialLogins
}

export async function deleteSocialLoginById(
  id: number,
): Promise<SocialLogin[]> {
  const socialLogins: SocialLogin[] =
    await sql`DELETE FROM "SocialLogin" WHERE "id" = ${id} RETURNING *`
  return socialLogins
}

export async function updateSocialLoginTokens(
  platformId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date,
): Promise<void> {
  await sql`
    UPDATE "SocialLogin"
    SET "accessToken" = ${accessToken},
    "refreshToken" = ${refreshToken},
    "expiresAt" = ${expiresAt}
    WHERE "platform" = 'STRAVA' AND "platformId" = ${platformId}
  `
}
