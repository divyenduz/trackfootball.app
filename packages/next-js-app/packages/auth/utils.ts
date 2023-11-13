import type { SocialLogin, User } from '@prisma/client'
import { sql } from '@trackfootball/database'
import { NextApiRequest, NextApiResponse } from 'next'
import onHeaders from 'on-headers'

import auth0, { Session } from './auth0'

export const MESSAGE_UNAUTHORIZED =
  'Unauthorized, are you logged in? Please login at ' + process.env.HOMEPAGE_URL

export async function getCurrentUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  onHeaders(res, () => {
    res.removeHeader('Set-Cookie')
  })
  const session = auth0().getSession(req, res) as Session

  if (!Boolean(session)) {
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
