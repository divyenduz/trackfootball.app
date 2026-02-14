import type { SocialLogin, User } from '../types'
import { Sql } from 'postgres'
import invariant from 'tiny-invariant'

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

export async function getUserByEmail(
  sql: Sql,
  email: string,
): Promise<User | null> {
  const users: User[] = await sql`
  SELECT * FROM "User"
  WHERE "User"."email" = ${email}
  `
  return users[0] || null
}

export async function createUserFromAuthSession(
  sql: Sql,
  authUser: {
    email: string
    name: string
    image?: string | null
  },
): Promise<User> {
  const firstName = authUser.name?.split(' ')[0] ?? null
  const lastName = authUser.name?.split(' ').slice(1).join(' ') ?? null
  const users: User[] = await sql`
    INSERT INTO "User" ("email", "firstName", "lastName", "picture", "locale", "emailVerified", "type", "createdAt", "updatedAt")
    VALUES (${authUser.email}, ${firstName}, ${lastName}, ${authUser.image ?? null}, 'en', true, 'USER', NOW(), NOW())
    ON CONFLICT ("email") DO UPDATE SET "updatedAt" = NOW()
    RETURNING *
  `
  invariant(users[0], 'Failed to create user from auth session')
  return users[0]
}

export async function deleteStravaSocialLogin(sql: Sql, platformId: number) {
  const socialLogins: SocialLogin[] =
    await sql`DELETE FROM "SocialLogin" WHERE "platform" = 'STRAVA' AND "platformId" = ${platformId} RETURNING *`
  return socialLogins
}
