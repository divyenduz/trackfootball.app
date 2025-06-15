import { env } from 'cloudflare:workers'

export async function Login({ request }: { request: Request }) {
  const authUrl = new URL(`${env.AUTH0_ISSUER_BASE_URL}/authorize`)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', env.AUTH0_CLIENT_ID)
  authUrl.searchParams.set(
    'redirect_uri',
    `${env.AUTH0_BASE_URL}/api/auth/callback`
  )
  authUrl.searchParams.set('scope', 'openid profile email')
  authUrl.searchParams.set('state', crypto.randomUUID())

  return new Response(null, {
    status: 302,
    headers: { Location: authUrl.toString() },
  })
}
