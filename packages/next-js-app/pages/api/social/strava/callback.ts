import type { Platform } from '@prisma/client'
import { sql } from '@trackfootball/database'
import { NextApiRequest, NextApiResponse } from 'next'
import { tokenExchange } from 'services/strava/token'

import {
  MESSAGE_UNAUTHORIZED,
  getCurrentUser,
} from '../../../../packages/auth/utils'
import { ensureUser } from '../../../../packages/utils/utils'

export const stravaCallbackHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const code = req.query.code as string
  const scope = req.query.scope as string
  const redirectTo = req.query.redirect_to as 'dashboard' | 'athlete'
  const onboarding = req.query.onboarding as string

  const tokenExchangeResponse = await tokenExchange(code)
  if (!tokenExchangeResponse) {
    res
      .status(400)
      .send('Invalid code, maybe the Strava code expired. Please try again.')
    return
  }
  const userStravaId = tokenExchangeResponse.athlete.id.toString()

  const user = await getCurrentUser(req, res)

  const expiresAt = new Date(tokenExchangeResponse.expires_at * 1000)

  if (!ensureUser(user)) {
    res.status(403).redirect(MESSAGE_UNAUTHORIZED)
    return
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
    res.status(302).redirect(process.env.HOMEPAGE_URL + `/athlete/${user.id}`)
    return
  }

  if (Boolean(onboarding)) {
    res.status(302).redirect(process.env.HOMEPAGE_URL + `/dashboard`)
    return
  }

  res.status(302).redirect(process.env.HOMEPAGE_URL + `/dashboard`)
  return
}

export default stravaCallbackHandler
