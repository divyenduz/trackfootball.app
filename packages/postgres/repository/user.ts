import type { SocialLogin, User } from '../types'
import { Sql } from 'postgres'

export async function getUser(sql: Sql, id: number): Promise<User | null> {
  const users: User[] = await sql`SELECT * FROM "User" WHERE "id" = ${id}`
  return users[0] || null
}

export async function getUserStravaSocialLogin(
  sql: Sql,
  userId: number,
): Promise<SocialLogin | null> {
  const socialLogins: SocialLogin[] =
    await sql`SELECT * FROM "SocialLogin" WHERE "userId" = ${userId}`
  return socialLogins.find((sl) => sl.platform === 'STRAVA') ?? null
}

export async function getUserBy(
  sql: Sql,
  stravaId: string,
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
  auth0Sub: string,
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
