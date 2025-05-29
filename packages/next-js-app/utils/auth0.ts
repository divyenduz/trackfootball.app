import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { repository } from '@trackfootball/database'
import { createDiscordMessage } from '@trackfootball/service'
import { NextResponse } from 'next/server'

const auth0 = new Auth0Client({
  session: {
    absoluteDuration: 86400 * 365, // 365 days
    rolling: false,
    cookie: {
      domain: process.env.COOKIE_DOMAIN,
    },
  },
  appBaseUrl: Bun.env.HOMEPAGE_URL,
  routes: {
    login: '/login',
    logout: '/logout',
    callback: '/callback',
    backChannelLogout: '/backchannel-logout',
  },
  onCallback: async (error, ctx, session) => {
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        new URL('/?error=auth', process.env.HOMEPAGE_URL),
      )
    }

    if (!session?.user) {
      console.error('No session or user in callback')
      return NextResponse.redirect(
        new URL('/?error=session', process.env.HOMEPAGE_URL),
      )
    }

    try {
      const existingUser = await repository.getUserByAuth0Sub(session.user.sub!)

      const data = {
        firstName: session.user.given_name ?? session.user.nickname ?? '',
        lastName: session.user.family_name ?? '',
        email: session.user.email ?? '',
        locale: session.user.locale ?? 'en',
        picture: session.user.picture ?? '',
        auth0Sub: session.user.sub!,
        emailVerified: session.user.email_verified!,
        updatedAt: new Date(),
      }

      const user = await repository.upsertUserByAuth0Sub(data)

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

      // Return default redirect or use returnTo from context
      const redirectUrl = ctx.returnTo || '/'
      return NextResponse.redirect(
        new URL(redirectUrl, process.env.HOMEPAGE_URL),
      )
    } catch (err) {
      console.error('Error in callback hook:', err)
      return NextResponse.redirect(
        new URL('/?error=processing', process.env.HOMEPAGE_URL),
      )
    }
  },
})

export default auth0
