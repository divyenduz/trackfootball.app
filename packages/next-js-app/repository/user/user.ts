import { SocialLogin, User } from '@prisma/client'
import { sql } from '@trackfootball/database'

export async function getUser(id: number): Promise<User | null> {
  const user = await sql<User[]>`SELECT * FROM "User" WHERE "id" = ${id}`
  return user[0]
}

export async function getUserStravaSocialLogin(
  userId: number
): Promise<SocialLogin | null> {
  const socialLogin = await sql<
    SocialLogin[]
  >`SELECT * FROM "SocialLogin" WHERE "userId" = ${userId}`
  return socialLogin.find((sl) => sl.platform === 'STRAVA') ?? null
}

export async function getUserBy(stravaId: string): Promise<User | null> {
  const user = await sql<User[]>`
  SELECT
	  "User".*
  FROM
    "User"
    INNER JOIN "SocialLogin" ON "User"."id" = "SocialLogin"."userId"
  WHERE
    "SocialLogin"."platformId" = ${stravaId}`
  return user[0]
}

export async function deleteStravaSocialLogin(platformId: number) {
  const r = await sql<
    SocialLogin[]
  >`DELETE FROM "SocialLogin" WHERE "platform" = 'STRAVA' AND "platformId" = ${platformId.toString()} RETURNING *`
  return r
}
