import type { SocialLogin } from '@trackfootball/kanel'
import { Sql } from 'postgres'

export async function getSocialLoginsByUserId(
  sql: Sql,
  userId: number
): Promise<SocialLogin[]> {
  const socialLogins: SocialLogin[] = await sql`
  SELECT * FROM "SocialLogin"
  WHERE "SocialLogin"."userId" = ${userId}
  `
  return socialLogins
}

export async function deleteSocialLoginById(
  sql: Sql,
  id: number
): Promise<SocialLogin[]> {
  const socialLogins: SocialLogin[] =
    await sql`DELETE FROM "SocialLogin" WHERE "id" = ${id} RETURNING *`
  return socialLogins
}

export async function updateSocialLoginTokens(
  sql: Sql,
  platformId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date
): Promise<void> {
  await sql`
    UPDATE "SocialLogin"
    SET "accessToken" = ${accessToken},
    "refreshToken" = ${refreshToken},
    "expiresAt" = ${expiresAt}
    WHERE "platform" = 'STRAVA' AND "platformId" = ${platformId}
  `
}

export async function upsertSocialLogin(
  sql: Sql,
  data: {
    userId: number
    platform: string
    platformId: string
    platformScope: string
    platformMeta: string
    accessToken: string
    refreshToken: string
    expiresAt: Date
    updatedAt: Date
  }
): Promise<void> {
  await sql`
    INSERT INTO "SocialLogin" ${sql(data)}
    ON CONFLICT ("platformId") DO UPDATE
    SET ${sql(data)}
  `
}
