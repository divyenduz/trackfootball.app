import { initAuth0 } from '@auth0/nextjs-auth0'
import { SignInWithAuth0 } from '@auth0/nextjs-auth0/dist/instance'

export interface Session {
  user: User
  idToken: string
  accessToken: string
  accessTokenScope: string
  accessTokenExpiresAt: number
  token_type: string
}

interface User {
  given_name?: string
  family_name?: string
  nickname: string
  name: string
  picture: string
  locale: string
  updated_at: string
  email: string
  email_verified: boolean
  sub: string
}

let auth0: SignInWithAuth0
const auth0Handler = () => {
  if (!auth0) {
    auth0 = initAuth0({
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      routes: {
        callback: '/api/auth/callback',
        postLogoutRedirect: '/',
      },
      session: {
        // Session cookie expiry
        absoluteDuration: 86400 * 30, // 30 days
        rolling: false,
        cookie: {
          domain: process.env.COOKIE_DOMAIN,
        },
      },
    })
  }
  return auth0
}

export default auth0Handler
