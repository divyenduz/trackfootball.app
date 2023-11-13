import type { User } from '@prisma/client'
import { sql } from '@trackfootball/database'
import { NextApiRequest, NextApiResponse } from 'next'

import auth0, { Session } from '../../../packages/auth/auth0'
import { createDiscordMessage } from '../../../packages/services/discord'

export const handleCallbackCustom = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await auth0().handleCallback(req, res)
  const session = auth0().getSession(req, res) as Session

  const existingUser = (
    await sql<User[]>`
  SELECT * FROM "User"
  WHERE "auth0Sub" = ${session.user.sub}
  `
  )[0]

  const data = {
    firstName: session.user.given_name!,
    lastName: session.user.family_name!,
    email: session.user.email!,
    locale: session.user.locale!,
    picture: session.user.picture!,
    auth0Sub: session.user.sub!,
    emailVerified: session.user.email_verified!,
    // TODO: use database's now()
    updatedAt: new Date(),
  }

  const user = (
    await sql`
  INSERT INTO "User" ${sql(data)}
  ON CONFLICT ("auth0Sub") DO UPDATE
  SET ${sql(data)}
  RETURNING *
  `
  )[0]

  if (!existingUser) {
    await createDiscordMessage({
      heading: 'New User Created',
      name: `${user.firstName} ${user.lastName}`,
      description: `
ID: ${user.id}
Link: ${process.env.HOMEPAGE_URL}/athlete/${user.id}`,
    })
  }
}

export default handleCallbackCustom
