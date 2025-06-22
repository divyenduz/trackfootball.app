import type { SocialLogin, User } from '@trackfootball/kanel'
import { getSocialLoginsByUserId } from './socialLogin'
import invariant from 'tiny-invariant'
import { Sql } from 'postgres'

export async function getUser(sql: Sql, id: number): Promise<User | null> {
  const users: User[] = await sql`SELECT * FROM "User" WHERE "id" = ${id}`
  return users[0] || null
}

export async function getUserById(sql: Sql, id: number): Promise<User | null> {
  const users: User[] = await sql`SELECT * FROM "User" WHERE "id" = ${id}`
  return users[0] || null
}

export async function getUserStravaSocialLogin(
  sql: Sql,
  userId: number
): Promise<SocialLogin | null> {
  const socialLogins: SocialLogin[] =
    await sql`SELECT * FROM "SocialLogin" WHERE "userId" = ${userId}`
  return socialLogins.find((sl) => sl.platform === 'STRAVA') ?? null
}

export async function getUserBy(
  sql: Sql,
  stravaId: string
): Promise<User | null> {
  const users: User[] = await sql`
  SELECT
	  "User".*
  FROM
    "User"
    INNER JOIN "SocialLogin" ON "User"."id" = "SocialLogin"."userId"
  WHERE
    "SocialLogin"."platformId" = ${stravaId}`
  return users[0] || null
}

export async function getUserByAuth0Sub(
  sql: Sql,
  auth0Sub: string
): Promise<User | null> {
  const users: User[] = await sql`
  SELECT * FROM "User"
  WHERE "User"."auth0Sub" = ${auth0Sub}
  `
  return users[0] || null
}

export async function deleteStravaSocialLogin(sql: Sql, platformId: number) {
  const socialLogins: SocialLogin[] =
    await sql`DELETE FROM "SocialLogin" WHERE "platform" = 'STRAVA' AND "platformId" = ${platformId} RETURNING *`
  return socialLogins
}

export async function getUserWithSocialLoginsByAuth0Sub(
  sql: Sql,
  auth0Sub: string
): Promise<(User & { socialLogin: SocialLogin[] }) | null> {
  const user = await getUserByAuth0Sub(sql, auth0Sub)
  if (!user) {
    return null
  }

  const socialLogin = await getSocialLoginsByUserId(sql, user.id)

  return {
    ...user,
    socialLogin,
  }
}

export async function upsertUserByAuth0Sub(
  sql: Sql,
  userData: {
    firstName: string
    lastName: string
    email: string
    locale: string
    picture: string
    auth0Sub: string
    emailVerified: boolean
    updatedAt: Date
  }
): Promise<User> {
  const users: User[] = await sql`
    INSERT INTO "User" ${sql(userData)}
    ON CONFLICT ("auth0Sub") DO UPDATE
    SET ${sql(userData)}
    RETURNING *
  `
  const user = users[0]
  invariant(user, `expected user to exist`)
  return user
}
