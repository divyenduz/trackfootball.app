import {
  PostType,
  repository,
  StravaWebhookEventStatus,
} from '@trackfootball/database'
import { stringify } from '../next-js-app/packages/utils/utils'
import invariant from 'tiny-invariant'
import { createDiscordMessage } from './discord'
import {
  getActivityById,
  getActivityStreams,
  getLoggedInAthleteActivities,
} from '@trackfootball/open-api'
import { match } from 'ts-pattern'
import { GeoData } from '@trackfootball/sprint-detection/geoData'
import {
  getPostByIdWithoutField,
  updatePostComplete,
  updatePostStatus,
} from '@trackfootball/database/repository/post'
import { durationToSeconds } from '../unit-utils'
import { postAddField } from './addField'
import { Core } from '@trackfootball/sprint-detection'

export async function importStravaActivity(
  ownerId: number,
  activityId: number,
  source: 'WEBHOOK' | 'MANUAL',
) {
  try {
    const user = await repository.getUserBy(stringify(ownerId))
    if (!user) {
      await createDiscordMessage({
        heading: `New Activity Creation Failed - No Social Login For User (${source})`,
        name: `${ownerId}/${activityId}`,
        description: `
      User has no Strava social login configured
      Strava Owner: ${ownerId}
      Activity ID: ${activityId}
      Athlete Link: https://strava.com/athletes/${ownerId}
      Activity Link: https://strava.com/activities/${activityId}`,
      })
      return Response.json(
        { error: 'User has no Strava social login configured' },
        { status: 400 },
      )
    }
    invariant(user, `failed to find user by strava owner_id ${ownerId}`)

    const existingPostId = await repository.getPostIdBy(activityId)
    if (existingPostId) {
      await createDiscordMessage({
        heading: `New Activity Creation Failed - Post Already Exists (${source})`,
        name: `${ownerId}/${activityId}`,
        description: `
      Strava ID: ${activityId}
      Strava Owner: ${ownerId}
      Athlete Link: https://strava.com/athletes/${ownerId}
      Activity Link: https://strava.com/activities/${activityId}
      Link: ${process.env.HOMEPAGE_URL}/activity/${existingPostId}`,
      })
      const existingWebhookEvent =
        await repository.findStravaWebhookEventByActivityId(activityId)
      if (existingWebhookEvent) {
        await repository.updateStravaWebhookEventStatus(
          existingWebhookEvent.id,
          StravaWebhookEventStatus.COMPLETED,
        )
      }
    }
    invariant(!existingPostId, `post already exists`)

    const activity = await fetchStravaActivity(activityId, user.id)

    const activityType = activity.type
    if (!activityType) {
      await createDiscordMessage({
        heading: `New Activity Creation Failed - No Type (${source})`,
        name: `${ownerId}/${activityId}`,
        description: `
      Strava ID: ${activityId}
      Strava Owner: ${ownerId}
      Athlete Link: https://strava.com/athletes/${ownerId}
      Activity Link: https://strava.com/activities/${activityId}`,
      })
      const existingWebhookEvent =
        await repository.findStravaWebhookEventByActivityId(activityId)
      if (existingWebhookEvent) {
        await repository.deleteStravaWebhookEvent(existingWebhookEvent.id)
      }
      return Response.json({ error: 'Activity has no type' }, { status: 400 })
    }
    invariant(
      activityType,
      `activity must have a type, found ${activity.name} ${activity.type}`,
    )

    const isGeoDataAvailable =
      activity.start_latlng && activity.start_latlng.length > 0
    if (!isGeoDataAvailable) {
      await createDiscordMessage({
        heading: `New Activity Creation Failed - No Geo Data (${source})`,
        name: `${ownerId}/${activityId}`,
        description: `
      Strava ID: ${activityId}
      Strava Owner: ${ownerId}
      Athlete Link: https://strava.com/athletes/${ownerId}
      Activity Link: https://strava.com/activities/${activityId}`,
      })
      const existingWebhookEvent =
        await repository.findStravaWebhookEventByActivityId(activityId)
      if (existingWebhookEvent) {
        await repository.deleteStravaWebhookEvent(existingWebhookEvent.id)
      }
      return Response.json(
        { error: 'Activity has no geo data' },
        { status: 400 },
      )
    }
    invariant(
      isGeoDataAvailable,
      `activity must geo data, found ${activity.start_latlng} ${activity.end_latlng}`,
    )

    if (!['Run', 'Soccer'].includes(activityType)) {
      await createDiscordMessage({
        heading: `New Activity Creation Failed - Type Not Supported ${activityType} (${source})`,
        name: `${ownerId}/${activityId}`,
        description: `
      Strava ID: ${activityId}
      Strava Owner: ${ownerId}
      Athlete Link: https://strava.com/athletes/${ownerId}
      Activity Link: https://strava.com/activities/${activityId}`,
      })

      const existingWebhookEvent =
        await repository.findStravaWebhookEventByActivityId(activityId)
      if (existingWebhookEvent) {
        await repository.deleteStravaWebhookEvent(existingWebhookEvent.id)
      }

      return Response.json(
        { error: `Activity type ${activity.type} not supported` },
        { status: 400 },
      )
    }

    const activityName = activity.name
    invariant(activityName, 'activity must have a name')

    const data = {
      type: 'STRAVA_ACTIVITY' as PostType,
      key: stringify(activityId),
      text: activityName,
      userId: user.id,
    }

    const post = await repository.createPost(data)

    if (!post) {
      return Response.json(
        { error: `Failed to create post for activity ${activityId}` },
        { status: 500 },
      )
    }

    await fetchCompletePost({
      postId: post.id,
    })
    const updatedPost = await repository.getPostWithUserAndFields(post.id)

    await createDiscordMessage({
      heading: `New Activity Created (${source})`,
      name: `${post.text}`,
      description: `
      ID: ${post.id} / Strava ID: ${activityId}
      Activity Time: ${updatedPost?.startTime}
      User: ${user.firstName} ${user.lastName}
      Link: ${process.env.HOMEPAGE_URL}/activity/${post.id}`,
    })

    const existingWebhookEvent =
      await repository.findStravaWebhookEventByActivityId(activityId)
    if (existingWebhookEvent) {
      await repository.updateStravaWebhookEventStatus(
        existingWebhookEvent.id,
        StravaWebhookEventStatus.COMPLETED,
      )
    }

    return Response.json({
      success: true,
      post: {
        id: post.id,
        text: post.text,
        stravaId: activityId,
      },
    })
  } catch (error) {
    console.error('Error creating activity:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const stravaClientId = Bun.env.STRAVA_CLIENT_ID
const stravaClientSecret = Bun.env.STRAVA_CLIENT_SECRET

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
  code: string,
): Promise<TokenExchangeResponse> {
  const link = 'https://www.strava.com/api/v3/oauth/token'

  const form = new FormData()
  invariant(stravaClientId, `stravaClientId not set`)
  invariant(stravaClientSecret, `stravaClientSecret not set`)
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

  const user = await repository.getUser(userId)
  if (!user) {
    console.error(`getStravaToken: User with id ${userId} not found`)
    return null
  }

  const stravaSocialLogin = await repository.getUserStravaSocialLogin(userId)
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

      await repository.updateSocialLoginTokens(
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

export async function fetchStravaActivity(activityId: number, userId: number) {
  const stravaAccessTokenHeaders = await getStravaAccessTokenHeaders(userId)
  const activity = await getActivityById(
    activityId,
    {
      include_all_efforts: false,
    },
    {
      headers: stravaAccessTokenHeaders,
    },
  )
  return activity
}

export async function fetchStravaActivityGeoJson(
  activityId: number,
  userId: number,
) {
  const stravaAccessTokenHeaders = await getStravaAccessTokenHeaders(userId)
  const activityStreams = await getActivityStreams(
    activityId,
    {
      keys: ['latlng', 'time', 'heartrate'],
      key_by_type: true,
    },
    {
      headers: stravaAccessTokenHeaders,
    },
  )

  const activity = await fetchStravaActivity(activityId, userId)
  const activityName = activity.name
  invariant(activityName, 'activity must have a name')
  const activityStartDate = activity.start_date
  invariant(activityStartDate, 'activity must have a start date')
  const geoJson = match(Boolean(activityStreams))
    .with(true, () =>
      new GeoData(
        activityName,
        JSON.stringify(activityStreams),
        'StravaActivityStream',
        new Date(activityStartDate),
      ).toGeoJson(),
    )
    .otherwise(() => null)

  return geoJson
}

interface FetchCompletePostArgs {
  postId: number
}

export async function fetchCompletePost({ postId }: FetchCompletePostArgs) {
  {
    const post = await getPostByIdWithoutField(postId)

    if (!post) {
      console.error(`post.fetchComplete: post ${postId} not found`)
      return
    }

    await updatePostStatus(post.id, 'PROCESSING')

    const geoJson = await fetchStravaActivityGeoJson(
      parseInt(post.key),
      post.userId,
    )

    if (geoJson instanceof Error) {
      throw geoJson
    }

    if (!geoJson) {
      throw new Error(`No geoJson found for Post id: ${postId}`)
    }

    const core = new Core(geoJson)

    const updatedPost = await updatePostComplete({
      id: post.id,
      geoJson: geoJson as any,
      totalDistance: core.totalDistance(),
      startTime: new Date(core.getStartTime()),
      elapsedTime: durationToSeconds(core.elapsedTime()),
      totalSprintTime: durationToSeconds(core.totalSprintTime()),
      sprints: core.sprints() as any,
      runs: core.runs() as any,
      maxSpeed: core.maxSpeed(),
      averageSpeed: core.averageSpeed(),
    })

    await postAddField({
      postId: post.id,
    })

    return { post: updatedPost }
  }
}
