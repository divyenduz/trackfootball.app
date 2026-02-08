import { Sql } from 'postgres'

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
  },
): Promise<void> {
  await sql`
    INSERT INTO "SocialLogin" ${sql(data)}
    ON CONFLICT ("platformId") DO UPDATE
    SET ${sql(data)}
  `
}

export async function updateSocialLoginTokens(
  sql: Sql,
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
