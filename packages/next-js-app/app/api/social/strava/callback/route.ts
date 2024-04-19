import type { Platform } from '@prisma/client'
import { sql } from '@trackfootball/database'
import { redirect } from 'next/navigation'
import { MESSAGE_UNAUTHORIZED } from 'packages/auth/utils'
import { ensureUser } from 'packages/utils/utils'
import { tokenExchange } from 'services/strava/token'
import { getCurrentUser } from 'utils/getCurrentUser'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code') as string
  const scope = searchParams.get('scope') as string
  const redirectTo = searchParams.get('redirect_to') as 'dashboard' | 'athlete'
  const onboarding = searchParams.get('onboarding') as string

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

  const user = await getCurrentUser()
  const expiresAt = new Date(tokenExchangeResponse.expires_at * 1000)

  if (!ensureUser(user)) {
    return new Response(MESSAGE_UNAUTHORIZED, {
      status: 403,
    })
  } else {
    // Update

    const data = {
      userId: user.id,
      platform: 'STRAVA' as Platform,
      platformId: userStravaId,
      platformScope: scope,
      platformMeta: '',
      accessToken: tokenExchangeResponse.access_token,
      refreshToken: tokenExchangeResponse.refresh_token,
      expiresAt,
      // TODO: use database's now()
      updatedAt: new Date(),
    }

    await sql`
    INSERT INTO "SocialLogin" ${sql(data)}
    ON CONFLICT ("platformId") DO UPDATE
    SET ${sql(data)}
    `
  }

  if (redirectTo === 'athlete') {
    return redirect(process.env.HOMEPAGE_URL + `/athlete/${user.id}`)
  }

  if (Boolean(onboarding)) {
    return redirect(process.env.HOMEPAGE_URL + `/dashboard`)
  }

  return redirect(process.env.HOMEPAGE_URL + `/dashboard`)
}
