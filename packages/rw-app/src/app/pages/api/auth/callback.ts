import { getSecret } from '@/auth/lib'
import { env } from 'cloudflare:workers'
import * as cookie from 'cookie'
import { EncryptJWT } from 'jose'

export async function Callback({ request }: { request: Request }) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code) {
    return new Response(
      JSON.stringify({ error: 'Missing authorization code' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  try {
    const tokenResponse = await fetch(
      `${env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: env.AUTH0_CLIENT_ID,
          client_secret: env.AUTH0_CLIENT_SECRET,
          code,
          redirect_uri: `${env.AUTH0_BASE_URL}/api/auth/callback`,
        }),
      },
    )

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed')
    }

    const tokens = (await tokenResponse.json()) as {
      access_token: string
      id_token: string
      refresh_token: string
    }
    const { access_token, id_token, refresh_token } = tokens

    const secret = await getSecret()
    const jwt = await new EncryptJWT({
      accessToken: access_token,
      idToken: id_token,
      refreshToken: refresh_token,
    })
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuedAt()
      .setExpirationTime('1w')
      .encrypt(secret)

    const sessionCookie = cookie.serialize('appSession', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      domain: env.COOKIE_DOMAIN,
      path: '/',
    })

    return new Response(null, {
      status: 302,
      headers: {
        Location: '/dashboard',
        'Set-Cookie': sessionCookie,
      },
    })
  } catch (error) {
    console.error('Callback error:', error)
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
