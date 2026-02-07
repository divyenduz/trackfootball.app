import type { StravaWebhookEvent } from '@trackfootball/postgres'
import {
  createDiscordMessage,
  processStravaWebhookEvent,
} from '@trackfootball/service'
import { DefaultAppContext } from 'rwsdk/worker'
import invariant from 'tiny-invariant'
import { env } from 'cloudflare:workers'

export async function StravaWebhookCallback({
  request,
  ctx,
}: {
  request: Request
  ctx: DefaultAppContext
}) {
  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url)
    const hubChallenge = searchParams.get('hub.challenge')
    const hubVerifyToken = searchParams.get('hub.verify_token')
    const hubMode = searchParams.get('hub.mode')

    const expectedVerifyToken = env.STRAVA_WEBHOOK_VERIFY_TOKEN
    invariant(expectedVerifyToken, 'STRAVA_WEBHOOK_VERIFY_TOKEN is required')

    if (
      hubMode === 'subscribe' &&
      expectedVerifyToken &&
      hubVerifyToken === expectedVerifyToken
    ) {
      invariant(hubChallenge, 'hub.challenge is required for subscription')
      console.info('Strava webhook subscription verified')
      return Response.json({ 'hub.challenge': hubChallenge })
    }

    return Response.json({ ok: true })
  }
  if (request.method === 'POST') {
    const body = await request.json()

    const stravaWebhookEvent = await ctx.repository.createStravaWebhookEvent({
      status: 'PENDING',
      body: JSON.stringify(body),
      errors: [],
    })

    try {
      await processStravaWebhookEvent(stravaWebhookEvent, {
        repository: ctx.repository,
        createDiscordMessage,
        env: {
          HOMEPAGE_URL: env.HOMEPAGE_URL,
        },
      })
    } catch (e) {
      console.error(`Error while processing event`, e)
    }

    return Response.json({ ok: true })
  }
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'GET, POST' },
  })
}

