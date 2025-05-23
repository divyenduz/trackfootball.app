import { sql, User } from '@trackfootball/database'
import { NextApiRequest, NextApiResponse } from 'next'
import { createDiscordMessage } from 'packages/services/discord'
import auth0 from 'utils/auth0'

// https://github.com/auth0/nextjs-auth0/blob/main/EXAMPLES.md
export const GET = auth0.handleAuth({
  onError(req: Request, error: Error) {
    console.error(error)
  },
  async login(req: NextApiRequest, res: NextApiResponse) {
    const r = await auth0.handleLogin(req, res)
    return r
  },
  async callback(req: NextApiRequest, res: NextApiResponse) {
    const r = await auth0.handleCallback(req, res)
    const session = await auth0.getSession(req, res)

    const existingUsers: User[] = await sql`
  SELECT * FROM "User"
  WHERE "auth0Sub" = ${session?.user.sub}
  `
    const existingUser = existingUsers[0]

    const data = {
      firstName: session?.user.given_name ?? session?.user.nickname,
      lastName: session?.user.family_name ?? '',
      email: session?.user.email!,
      locale: session?.user.locale ?? 'en',
      picture: session?.user.picture!,
      auth0Sub: session?.user.sub!,
      emailVerified: session?.user.email_verified!,
      // TODO: use database's now()
      updatedAt: new Date(),
    }

    const users: User[] = await sql`
    INSERT INTO "User" ${sql(data)}
    ON CONFLICT ("auth0Sub") DO UPDATE
    SET ${sql(data)}
    RETURNING *
    `
    const user = users[0]

    if (!existingUser) {
      if (user) {
        await createDiscordMessage({
          heading: 'New User Created',
          name: `${user.firstName} ${user.lastName}`,
          description: `
ID: ${user.id}
Link: ${process.env.HOMEPAGE_URL}/athlete/${user.id}`,
        })
      } else {
        await createDiscordMessage({
          heading: '🐛 New User Creation Failed',
          name: `${data.firstName} ${data.lastName}`,
          description: `Failed to create user with email: ${data.email}`,
        })
      }
    } else {
      await createDiscordMessage({
        heading: 'Existing User Logged In',
        name: `${user.firstName} ${user.lastName}`,
        description: `
ID: ${user.id}
Link: ${process.env.HOMEPAGE_URL}/athlete/${user.id}`,
      })
    }

    return r
  },
  async logout(req: NextApiRequest, res: NextApiResponse) {
    try {
      const r = await auth0.handleLogout(req, res)
      return r
    } catch (error) {
      console.error(error)
    }
  },
})
