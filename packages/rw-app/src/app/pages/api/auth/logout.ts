import { env } from 'cloudflare:workers'
import * as cookie from 'cookie'

export async function Logout({ request }: { request: RequestInfo }) {
  const logoutCookie = cookie.serialize('appSession', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    domain: env.COOKIE_DOMAIN,
    path: '/',
  })

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/home',
      'Set-Cookie': logoutCookie,
    },
  })
}
