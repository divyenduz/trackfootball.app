import { initAuth0 } from '@auth0/nextjs-auth0'

const auth0 = initAuth0({
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  routes: {
    callback: '/api/auth/callback',
    postLogoutRedirect: '/',
  },
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.AUTH0_BASE_URL,
  session: {
    absoluteDuration: 86400 * 30, // 30 days
    rolling: false,
    cookie: {
      domain: process.env.COOKIE_DOMAIN,
    },
  },
})

export default auth0
