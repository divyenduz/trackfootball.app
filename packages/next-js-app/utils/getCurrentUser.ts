import { SocialLogin, User } from '@prisma/client'
import { sql } from '@trackfootball/database'

import auth0 from './auth0'

export async function getCurrentUser() {
  const session = await auth0.getSession()
  if (!session) {
    return null
  }

  const user = (
    await sql<User[]>`
  SELECT * FROM "User"
  WHERE "User"."auth0Sub" = ${session.user.sub}
  `
  )[0]

  const socialLogin = await sql<SocialLogin[]>`
  SELECT * FROM "SocialLogin"
  WHERE "SocialLogin"."userId" = ${user.id}
  `
  return {
    ...user,
    socialLogin,
  }
}
