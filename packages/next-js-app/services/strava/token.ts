import { sql as sqlImport } from '@trackfootball/database'

import { Maybe } from '../../packages/utils/types'
import { getUser, getUserStravaSocialLogin } from '../../repository/user/user'

const stravaClientId = process.env.STRAVA_CLIENT_ID
const stravaClientSecret = process.env.STRAVA_CLIENT_SECRET

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

export async function tokenExchange(
  code: string
): Promise<TokenExchangeResponse> {
  const link = 'https://www.strava.com/api/v3/oauth/token'

  const form = new FormData()
  form.append('client_id', stravaClientId)
  form.append('client_secret', stravaClientSecret)
  form.append('code', code)
  form.append('grant_type', 'authorization_code')

  const r = await fetch(link, {
    method: 'POST',
    body: form,
  })
  const tokenExchangeResponse = await r.json()
  return tokenExchangeResponse as TokenExchangeResponse
}

export async function tokenRefresh(
  refreshToken: string
): Promise<Omit<TokenExchangeResponse, 'athlete'>> {
  const link = 'https://www.strava.com/api/v3/oauth/token'

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

let sql: typeof sqlImport

if (typeof window === 'undefined') {
  sql = sqlImport
}

/**
 *
 * @param userId user id in our database
 * @returns Strava access token, refreshed if needed
 */
export async function getStravaToken(userId: number): Promise<Maybe> {
  const now = new Date()

  const user = await getUser(userId)
  if (!user) {
    console.error(`getStravaToken: User with id ${userId} not found`)
    return null
  }

  const stravaSocialLogin = await getUserStravaSocialLogin(userId)
  if (!stravaSocialLogin) {
    console.error(
      `getStravaToken: Strava social login with user id ${userId} not found`
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
          tokenRefreshResponse.errors
        )
        return null
      }

      const expiresAt = new Date(tokenRefreshResponse.expires_at * 1000)

      await sql`
      UPDATE "SocialLogin"
      SET "accessToken" = ${tokenRefreshResponse.access_token},
      "refreshToken" = ${tokenRefreshResponse.refresh_token},
      "expiresAt" = ${expiresAt}
      WHERE "platform" = 'STRAVA' AND "platformId" = ${userStravaId!.toString()}
      `

      return tokenRefreshResponse.access_token
    } catch (e) {
      console.error(`Failed to refresh Strava token: `, e)
      return null
    }
  } else {
    return accessToken!
  }
}
