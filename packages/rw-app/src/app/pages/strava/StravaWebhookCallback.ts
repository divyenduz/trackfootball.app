import { PostType, StravaWebhookEvent } from '@trackfootball/kanel'
import {
  createDiscordMessage,
  fetchCompletePost,
  fetchStravaActivity,
  importStravaActivity,
} from '@trackfootball/service'
import { DefaultAppContext, requestInfo } from 'rwsdk/worker'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'
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
      await processEvent(stravaWebhookEvent)
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

export const stringify = (value: number | string): string => {
  if (typeof value === 'number') {
    return value.toString()
  }
  return value
}

type StravaEventBase = {
  object_id: number
  owner_id: number
  subscription_id: number
  event_time: number
}

type StravaEventActivity = StravaEventBase & {
  object_type: 'activity'
  aspect_type: 'create' | 'update' | 'delete'
  updates: {
    title: string
    type: string
    private: boolean
  }
}

type StravaEventAthlete = StravaEventBase & {
  object_type: 'athlete'
  aspect_type: 'update'
  updates: {
    authorized: 'false'
  }
}

export type StravaEvent = StravaEventActivity | StravaEventAthlete

async function processEvent(event: StravaWebhookEvent) {
  const ctx = requestInfo.ctx
  const body: StravaEvent = JSON.parse(event.body)

  await match(body)
    .with(
      { object_type: 'activity', aspect_type: 'create' },
      async (activityCreateEvent) => {
        const ownerId = activityCreateEvent.owner_id
        const activityId = activityCreateEvent.object_id

        await importStravaActivity(
          ctx.repository,
          ownerId,
          activityId,
          'WEBHOOK'
        )

        await ctx.repository.updateStravaWebhookEventStatus(
          event.id,
          'COMPLETED'
        )
      }
    )
    .with(
      { object_type: 'activity', aspect_type: 'update' },
      async (activityUpdateEvent) => {
        const user = await ctx.repository.getUserBy(
          stringify(activityUpdateEvent.owner_id)
        )

        if (!user) {
          await createDiscordMessage({
            heading:
              'New Activity Update Failed - No Social Login For User (Update Webhook)',
            name: `${activityUpdateEvent.owner_id}/${activityUpdateEvent.object_id}`,
            description: `
        User has no Strava social login configured
        Strava Owner: ${activityUpdateEvent.owner_id}
        Activity ID: ${activityUpdateEvent.object_id}
        Athlete Link: https://strava.com/athletes/${activityUpdateEvent.owner_id}
        Activity Link: https://strava.com/activities/${activityUpdateEvent.object_id}`,
          })
          throw new Error(
            `Failed to find user with Strava ID: ${activityUpdateEvent.owner_id}`
          )
        }
        invariant(
          user,
          `failed to find user by strava owner_id ${activityUpdateEvent.owner_id}`
        )

        const activity = await fetchStravaActivity(
          ctx.repository,
          activityUpdateEvent.object_id,
          user.id
        )
        const activityType = activity.type
        if (!activityType) {
          await createDiscordMessage({
            heading: 'New Activity Update Failed - No Type (Update Webhook)',
            name: `${activityUpdateEvent.owner_id}/${activityUpdateEvent.object_id}`,
            description: `
        Strava ID: ${activityUpdateEvent.object_id}
        Strava Owner: ${activityUpdateEvent.owner_id}
        Athlete Link: https://strava.com/athletes/${activityUpdateEvent.owner_id}
        Activity Link: https://strava.com/activities/${activityUpdateEvent.object_id}`,
          })
          await ctx.repository.deleteStravaWebhookEvent(event.id)
          return
        }
        invariant(
          activityType,
          `activity must have a type, found ${activity.name} ${activity.type}`
        )

        const isGeoDataAvailable =
          activity.start_latlng && activity.start_latlng.length > 0
        if (!isGeoDataAvailable) {
          await createDiscordMessage({
            heading:
              'New Activity Update Failed - No Geo Data (Update Webhook)',
            name: `${activityUpdateEvent.owner_id}/${activityUpdateEvent.object_id}`,
            description: `
        Strava ID: ${activityUpdateEvent.object_id}
        Strava Owner: ${activityUpdateEvent.owner_id}
        Athlete Link: https://strava.com/athletes/${activityUpdateEvent.owner_id}
        Activity Link: https://strava.com/activities/${activityUpdateEvent.object_id}`,
          })
          await ctx.repository.deleteStravaWebhookEvent(event.id)
          return
        }
        invariant(
          isGeoDataAvailable,
          `activity must geo data, found ${activity.start_latlng} ${activity.end_latlng}`
        )

        if (!['Run', 'Soccer'].includes(activityType)) {
          console.info(
            `Activity type ${activity.type} not supported, Strava key: ${activityUpdateEvent.object_id}`
          )
          return
        }

        const post = await ctx.repository.getPostByStravaId(
          activityUpdateEvent.object_id
        )
        if (post?.id) {
          try {
            await ctx.repository.updatePostTitle(
              activityUpdateEvent.object_id,
              activityUpdateEvent.updates.title
            )
          } catch (e) {
            console.error(`activityUpdateEvent: `, e)
          }
        } else {
          const activityName = activity.name
          invariant(activityName, 'activity must have a name')
          const data = {
            type: 'STRAVA_ACTIVITY' as PostType,
            key: stringify(activityUpdateEvent.object_id),
            text: activityName,
            userId: user.id,
          }

          const post = await ctx.repository.createPost(data)

          if (!post) {
            throw new Error(`Failed to create post for data ${data}`)
          }

          await fetchCompletePost(ctx.repository, {
            postId: post.id,
          })
          const updatedPost = await ctx.repository.getPostWithUserAndFields(
            post.id
          )

          await createDiscordMessage({
            heading: 'New Activity Created (via Update Webhook)',
            name: `${post.text}`,
            description: `
        ID: ${post.id} / Strava ID: ${activityUpdateEvent.object_id}
        Activity Time: ${updatedPost?.startTime}
        User: ${user.firstName} ${user.lastName}
        Link: ${env.HOMEPAGE_URL}/activity/${post.id}`,
          })
        }
      }
    )
    .with(
      { object_type: 'activity', aspect_type: 'delete' },
      async (activityDeleteEvent) => {
        const user = await ctx.repository.getUserBy(
          stringify(activityDeleteEvent.owner_id)
        )

        if (!user) {
          await createDiscordMessage({
            heading:
              'Activity Deletion Failed - No Social Login For User (Webhook)',
            name: `${activityDeleteEvent.owner_id}/${activityDeleteEvent.object_id}`,
            description: `
        User has no Strava social login configured
        Strava Owner: ${activityDeleteEvent.owner_id}
        Activity ID: ${activityDeleteEvent.object_id}
        Athlete Link: https://strava.com/athletes/${activityDeleteEvent.owner_id}
        Activity Link: https://strava.com/activities/${activityDeleteEvent.object_id}`,
          })
          throw new Error(
            `Failed to find user with Strava ID: ${activityDeleteEvent.owner_id}`
          )
        }
        invariant(
          user,
          `failed to find user by strava owner_id ${activityDeleteEvent.owner_id}`
        )

        const post = await ctx.repository.deletePostBy(
          activityDeleteEvent.object_id
        )

        if (!post) {
          console.error(
            `Post to be deleted not found, Strava key: ${activityDeleteEvent.object_id}`
          )
          return
        }

        await createDiscordMessage({
          heading: 'Activity Deleted (Webhook)',
          name: `${post.text}`,
          description: `
      ID: ${post.id} / Strava ID: ${activityDeleteEvent.object_id}
      Activity Time: ${post?.startTime}
      User: ${user.firstName} ${user.lastName}
      Link: ${env.HOMEPAGE_URL}/activity/${post.id}`,
        })
      }
    )
    .with(
      { object_type: 'athlete', aspect_type: 'update' },
      async (athleteUpdateEvent) => {
        if (athleteUpdateEvent.updates.authorized === 'false') {
          ctx.repository.deleteStravaSocialLogin(athleteUpdateEvent.owner_id)
          await createDiscordMessage({
            heading: 'Athlete Social Login Deleted (Webhook)',
            name: `${athleteUpdateEvent.owner_id}`,
            description: ``,
          })
        }
      }
    )
    .exhaustive()
}
