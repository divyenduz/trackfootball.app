import {
  PostType,
  StravaWebhookEvent,
  StravaWebhookEventStatus,
} from '@prisma/client'
import { sql } from '@trackfootball/database'
import { createDiscordMessage } from 'packages/services/discord'
import { fetchCompletePost } from 'packages/services/post/fetchComplete'
import { stringify } from 'packages/utils/utils'
import {
  createPost,
  deletePostBy,
  getPost,
  updatePostTitle,
} from 'repository/post'
import { fetchStravaActivity } from 'repository/strava'
import { deleteStravaSocialLogin, getUserBy } from 'repository/user/user'
import { match } from 'ts-pattern'

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

type StravaEvent = StravaEventActivity | StravaEventAthlete

async function processEvent(event: StravaWebhookEvent) {
  const body: StravaEvent = JSON.parse(event.body)

  await match(body)
    .with(
      { object_type: 'activity', aspect_type: 'create' },
      async (activityCreateEvent) => {
        const user = await getUserBy(stringify(activityCreateEvent.owner_id))

        if (!user) {
          throw new Error(
            `Failed to find user with Strava ID: ${activityCreateEvent.owner_id}`
          )
        }

        const activity = await fetchStravaActivity(
          activityCreateEvent.object_id,
          user.id
        )

        if (!['Run', 'Soccer'].includes(activity.type)) {
          console.info(
            `Activity type ${activity.type} not supported, Strava key: ${activityCreateEvent.object_id}`
          )
          return
        }

        const data = {
          type: 'STRAVA_ACTIVITY' as PostType,
          key: stringify(activityCreateEvent.object_id),
          text: activity.name,
          userId: user.id,
        }

        const post = await createPost(data)

        if (!post) {
          throw new Error(`Failed to create post for data ${data}`)
        }

        await fetchCompletePost({
          postId: post.id,
        })
        const updatedPost = await getPost(post.id)

        await createDiscordMessage({
          heading: 'New Activity Created (Webhook)',
          name: `${post.text}`,
          description: `
      ID: ${post.id}
      Activity Time: ${updatedPost?.startTime}
      User: ${user.firstName} ${user.lastName}
      Link: ${process.env.HOMEPAGE_URL}/activity/${post.id}`,
        })
      }
    )
    .with(
      { object_type: 'activity', aspect_type: 'update' },
      async (activityUpdateEvent) => {
        const user = await getUserBy(stringify(activityUpdateEvent.owner_id))

        if (!user) {
          throw new Error(
            `Failed to find user with Strava ID: ${activityUpdateEvent.owner_id}`
          )
        }

        const activity = await fetchStravaActivity(
          activityUpdateEvent.object_id,
          user.id
        )

        if (!['Run', 'Soccer'].includes(activity.type)) {
          console.info(
            `Activity type ${activity.type} not supported, Strava key: ${activityUpdateEvent.object_id}`
          )
          return
        }

        try {
          await updatePostTitle(
            activityUpdateEvent.object_id,
            activityUpdateEvent.updates.title
          )
        } catch (e) {
          console.error(`activityUpdateEvent: `, e)
        }
      }
    )
    .with(
      { object_type: 'activity', aspect_type: 'delete' },
      async (activityDeleteEvent) => {
        const user = await getUserBy(stringify(activityDeleteEvent.owner_id))

        if (!user) {
          throw new Error(
            `Failed to find user with Strava ID: ${activityDeleteEvent.owner_id}`
          )
        }

        const post = await deletePostBy(activityDeleteEvent.object_id)

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
      ID: ${post.id}
      Activity Time: ${post?.startTime}
      User: ${user.firstName} ${user.lastName}
      Link: ${process.env.HOMEPAGE_URL}/activity/${post.id}`,
        })
      }
    )
    .with(
      { object_type: 'athlete', aspect_type: 'update' },
      async (athleteUpdateEvent) => {
        if (athleteUpdateEvent.updates.authorized === 'false') {
          deleteStravaSocialLogin(athleteUpdateEvent.owner_id)
          await createDiscordMessage({
            heading: 'Athlete Social Login Deleted (Webhook)',
            name: `${athleteUpdateEvent.owner_id}`,
            description: ``,
          })
        }
      }
    )
    .exhaustive()

  await sql`UPDATE "StravaWebhookEvent" SET "status" = ${StravaWebhookEventStatus.COMPLETED} WHERE "id" = ${event.id}`
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const hubChallenge = searchParams.get('hub.challenge')
  const hubVerifyToken = searchParams.get('hub.verify_token')
  const hubMode = searchParams.get('hub.mode')

  if (
    hubMode === 'subscribe' &&
    hubVerifyToken === '_STRAVA_HOOKS_OF_WEB_SECRET_'
  ) {
    console.info('Strava webhook subscription verified')
    return Response.json({ 'hub.challenge': hubChallenge })
  }

  return Response.json({ ok: true })
}

export async function POST(req: Request) {
  const body = await req.json()

  const data = {
    status: StravaWebhookEventStatus.PENDING,
    body: JSON.stringify(body),
    errors: [],
    updatedAt: sql`now()`,
  }
  const stravaWebhookEvent = await sql<StravaWebhookEvent[]>`
    INSERT INTO "public"."StravaWebhookEvent" ${
      //@ts-expect-error
      sql(data)
    }
    RETURNING *
  `

  if (stravaWebhookEvent.length > 0) {
    processEvent(stravaWebhookEvent[0]).catch((e) => {
      console.error(`Error while processing event`, e)
    })
  }

  return Response.json({ ok: true })
}
