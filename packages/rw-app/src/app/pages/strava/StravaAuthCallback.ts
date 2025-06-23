import { tokenExchange } from '@trackfootball/service'
import { DefaultAppContext } from 'rwsdk/worker'
import type { Platform } from '@trackfootball/kanel'
import { env } from 'cloudflare:workers'

export const MESSAGE_UNAUTHORIZED =
  'Unauthorized, are you logged in? Please login at ' + env.HOMEPAGE_URL

export async function StravaAuthCallback({
  request,
  ctx,
}: {
  request: Request
  ctx: DefaultAppContext
}) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code') as string
  const scope = searchParams.get('scope') as string

  const tokenExchangeResponse = await tokenExchange(code)
  if (!tokenExchangeResponse) {
    return new Response(
      'Invalid code, maybe the Strava code expired. Please try again.',
      {
        status: 400,
      }
    )
  }
  const userStravaId = tokenExchangeResponse.athlete.id.toString()

  const user = ctx.user
  const expiresAt = new Date(tokenExchangeResponse.expires_at * 1000)

  if (!user) {
    return new Response(MESSAGE_UNAUTHORIZED, {
      status: 403,
    })
  } else {
    const data = {
      userId: user.id,
      platform: 'STRAVA' as Platform,
      platformId: userStravaId,
      platformScope: scope,
      platformMeta: '',
      accessToken: tokenExchangeResponse.access_token,
      refreshToken: tokenExchangeResponse.refresh_token,
      expiresAt,
      updatedAt: new Date(),
    }

    await ctx.repository.upsertSocialLogin(data)
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/athlete/' + user.id,
    },
  })
}
