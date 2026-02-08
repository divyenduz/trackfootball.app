'use server'

import { requestInfo } from 'rwsdk/worker'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
import { getLoggedInAthleteActivities } from '@trackfootball/open-api'
import type { SocialLogin, User } from '@trackfootball/postgres'
import { env } from '@/env'

type Athlete = {
  id: number
  username: string
  resource_state: number
  firstname: string
  lastname: string
  city: string
  state: string
  country: string
  sex: string
  premium: boolean
  summit: boolean
  created_at: string
  updated_at: string
  badge_type_id: number
  profile_medium: string
  profile: string
  friend: any
  follower: any
}

type TokenExchangeResponse = {
  token_type: string
  expires_at: number
  expires_in: number
  refresh_token: string
  access_token: string
  athlete: Athlete
}

const stravaClientId = env.STRAVA_CLIENT_ID
invariant(stravaClientId, `stravaClientId not set`)
const stravaClientSecret = env.STRAVA_CLIENT_SECRET
invariant(stravaClientSecret, `stravaClientSecret not set`)

export async function tokenRefresh(
  refreshToken: string,
): Promise<Omit<TokenExchangeResponse, 'athlete'>> {
  const link = 'https://www.strava.com/api/v3/oauth/token'

  invariant(stravaClientId, `stravaClientId not set`)
  invariant(stravaClientSecret, `stravaClientSecret not set`)

  const form = new FormData()
  form.append('client_id', stravaClientId)
  form.append('client_secret', stravaClientSecret)
  form.append('refresh_token', refreshToken)
  form.append('grant_type', 'refresh_token')

  const r = await fetch(link, {
    method: 'POST',
    body: form,
  })
  const tokenRefreshResponse = await r.json()
  return tokenRefreshResponse as TokenExchangeResponse
}

export type Maybe<T = string, E = null> = T | E

/**
 *
 * @param userId user id in our database
 * @returns Strava access token, refreshed if needed
 */
export async function getStravaToken(userId: number): Promise<Maybe> {
  const now = new Date()

  const user = await requestInfo.ctx.repository.getUser(userId)
  if (!user) {
    console.error(`getStravaToken: User with id ${userId} not found`)
    return null
  }

  const stravaSocialLogin =
    await requestInfo.ctx.repository.getUserStravaSocialLogin(userId)
  if (!stravaSocialLogin) {
    console.error(
      `getStravaToken: Strava social login with user id ${userId} not found`,
    )
    return null
  }

  const userStravaId = stravaSocialLogin.platformId
  const expiresAt = stravaSocialLogin.expiresAt
  const refreshToken = stravaSocialLogin.refreshToken
  const accessToken = stravaSocialLogin.accessToken

  if (new Date(expiresAt!).getTime() < now.getTime()) {
    try {
      const tokenRefreshResponse = await tokenRefresh(refreshToken!)

      //@ts-expect-error
      if (tokenRefreshResponse.errors?.length > 0) {
        console.error(
          `Failed to refresh Strava token: `,
          //@ts-expect-error
          tokenRefreshResponse.message,
          ` Errors: `,
          //@ts-expect-error
          tokenRefreshResponse.errors,
        )
        return null
      }

      const expiresAt = new Date(tokenRefreshResponse.expires_at * 1000)

      await requestInfo.ctx.repository.updateSocialLoginTokens(
        userStravaId!.toString(),
        tokenRefreshResponse.access_token,
        tokenRefreshResponse.refresh_token,
        expiresAt,
      )

      return tokenRefreshResponse.access_token
    } catch (e) {
      console.error(`Failed to refresh Strava token: `, e)
      return null
    }
  } else {
    return accessToken!
  }
}

async function getStravaAccessTokenHeaders(userId: number) {
  const stravaAccessToken = await getStravaToken(userId)
  return {
    Authorization: `Bearer ${stravaAccessToken}`,
  }
}

export async function checkStravaAccessToken(userId: number) {
  const stravaAccessTokenHeaders = await getStravaAccessTokenHeaders(userId)
  try {
    await getLoggedInAthleteActivities(
      {
        per_page: 1,
      },
      {
        headers: stravaAccessTokenHeaders,
      },
    )
    return true
  } catch (e) {
    console.error('Error: strava check failed')
    console.error(e)
    return false
  }
}

export async function checkStravaToken(
  user: User & {
    socialLogin: SocialLogin[]
  },
) {
  if (!user) {
    console.error(
      'Note: failed to get strava access token, user not found in context',
    )
    return 'NOT_WORKING'
  }

  const socialLogin = user.socialLogin.find((sl) => sl.platform === 'STRAVA')

  if (!Boolean(socialLogin)) {
    return 'NOT_CONNECTED'
  }

  const r = await checkStravaAccessToken(user.id)
  return match(r)
    .with(true, () => 'WORKING')
    .with(false, () => 'NOT_WORKING')
    .exhaustive()
}
