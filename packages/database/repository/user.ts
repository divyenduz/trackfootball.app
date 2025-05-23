import { SocialLogin, User } from '@prisma/client'
import { sql } from '../index'
import { getSocialLoginsByUserId } from './socialLogin'

export async function getUser(id: number): Promise<User | null> {
  const users: User[] = await sql`SELECT * FROM "User" WHERE "id" = ${id}`
  return users[0] || null
}

export async function getUserById(id: number): Promise<User | null> {
  const users: User[] = await sql`SELECT * FROM "User" WHERE "id" = ${id}`
  return users[0] || null
}

export async function getUserStravaSocialLogin(
  userId: number,
): Promise<SocialLogin | null> {
  const socialLogins: SocialLogin[] =
    await sql`SELECT * FROM "SocialLogin" WHERE "userId" = ${userId}`
  return socialLogins.find((sl) => sl.platform === 'STRAVA') ?? null
}

export async function getUserBy(stravaId: string): Promise<User | null> {
  const users: User[] = await sql`
  SELECT
	  "User".*
  FROM
    "User"
    INNER JOIN "SocialLogin" ON "User"."id" = "SocialLogin"."userId"
  WHERE
    "SocialLogin"."platformId" = ${stravaId}`
  return users[0]
}

export async function getUserByAuth0Sub(auth0Sub: string): Promise<User | null> {
  const users: User[] = await sql`
  SELECT * FROM "User"
  WHERE "User"."auth0Sub" = ${auth0Sub}
  `
  return users[0]
}

export async function deleteStravaSocialLogin(platformId: number) {
  const socialLogins: SocialLogin[] =
    await sql`DELETE FROM "SocialLogin" WHERE "platform" = 'STRAVA' AND "platformId" = ${platformId} RETURNING *`
  return socialLogins
}

export async function getUserWithSocialLoginsByAuth0Sub(auth0Sub: string): Promise<(User & { socialLogin: SocialLogin[] }) | null> {
  const user = await getUserByAuth0Sub(auth0Sub)
  if (!user) {
    return null
  }

  const socialLogin = await getSocialLoginsByUserId(user.id)

  return {
    ...user,
    socialLogin,
  }
}
