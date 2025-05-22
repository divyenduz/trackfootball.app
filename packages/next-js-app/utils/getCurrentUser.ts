import { SocialLogin, User } from '@prisma/client'

import auth0 from './auth0'
import { sql } from 'bun'

export async function getCurrentUser() {
  const session = await auth0.getSession()
  if (!session) {
    return null
  }

  const users: User[] = await sql`
  SELECT * FROM "User"
  WHERE "User"."auth0Sub" = ${session.user.sub}
  `
  const user = users[0]

  const socialLogin: SocialLogin[] = await sql`
  SELECT * FROM "SocialLogin"
  WHERE "SocialLogin"."userId" = ${user.id}
  `
  return {
    ...user,
    socialLogin,
  }
}
