import type { StravaWebhookEvent } from '@trackfootball/postgres'
import { createDiscordMessage as defaultCreateDiscordMessage } from './discord'
import {
  IgnorableActivityError,
  importStravaActivity,
} from './strava'
import { match } from 'ts-pattern'
import type { createRepository } from '@trackfootball/postgres'

const stringify = (value: number | string): string => {
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

export type WebhookProcessorDeps = {
  repository: ReturnType<typeof createRepository>
  createDiscordMessage?: typeof defaultCreateDiscordMessage
  env: {
    HOMEPAGE_URL?: string
  }
}

export async function processStravaWebhookEvent(
  event: StravaWebhookEvent,
  deps: WebhookProcessorDeps,
) {
  const { repository, env } = deps
  const createDiscordMessageFn =
    deps.createDiscordMessage || defaultCreateDiscordMessage
  const body: StravaEvent = JSON.parse(event.body)

  try {
    await match(body)
      .with(
      { object_type: 'activity', aspect_type: 'create' },
      async (activityCreateEvent) => {
        const ownerId = activityCreateEvent.owner_id
        const activityId = activityCreateEvent.object_id

        try {
          await importStravaActivity(repository, ownerId, activityId, 'WEBHOOK')
          await repository.updateStravaWebhookEventStatus(
            event.id,
            'COMPLETED',
          )
        } catch (e) {
          if (e instanceof IgnorableActivityError) {
            await repository.deleteStravaWebhookEvent(event.id)
          } else {
            console.error(`Webhook activity create failed:`, e)
            await repository.updateStravaWebhookEventStatus(
              event.id,
              'ERRORED',
            )
          }
        }
      },
    )
    .with(
      { object_type: 'activity', aspect_type: 'update' },
      async (activityUpdateEvent) => {
        try {
          const user = await repository.getUserBy(
            stringify(activityUpdateEvent.owner_id),
          )

          if (!user) {
            await createDiscordMessageFn({
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
              `Failed to find user with Strava ID: ${activityUpdateEvent.owner_id}`,
            )
          }

          const post = await repository.getPostByStravaId(
            activityUpdateEvent.object_id,
          )
          if (post?.id) {
            if (activityUpdateEvent.updates.title) {
              try {
                await repository.updatePostTitle(
                  activityUpdateEvent.object_id,
                  activityUpdateEvent.updates.title,
                )
              } catch (e) {
                console.error(`activityUpdateEvent: `, e)
              }
            }
          } else {
            await importStravaActivity(
              repository,
              activityUpdateEvent.owner_id,
              activityUpdateEvent.object_id,
              'WEBHOOK',
            )
          }

          await repository.updateStravaWebhookEventStatus(
            event.id,
            'COMPLETED',
          )
        } catch (e) {
          if (e instanceof IgnorableActivityError) {
            await repository.deleteStravaWebhookEvent(event.id)
          } else {
            console.error(`Webhook activity update failed:`, e)
            await repository.updateStravaWebhookEventStatus(event.id, 'ERRORED')
          }
        }
      },
    )
    .with(
      { object_type: 'activity', aspect_type: 'delete' },
      async (activityDeleteEvent) => {
        try {
          const user = await repository.getUserBy(
            stringify(activityDeleteEvent.owner_id),
          )

          if (!user) {
            await createDiscordMessageFn({
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
              `Failed to find user with Strava ID: ${activityDeleteEvent.owner_id}`,
            )
          }

          const post = await repository.deletePostBy(
            activityDeleteEvent.object_id,
          )

          if (!post) {
            console.error(
              `Post to be deleted not found, Strava key: ${activityDeleteEvent.object_id}`,
            )
          } else {
            await createDiscordMessageFn({
              heading: 'Activity Deleted (Webhook)',
              name: `${post.text}`,
              description: `
        ID: ${post.id} / Strava ID: ${activityDeleteEvent.object_id}
        Activity Time: ${post?.startTime}
        User: ${user.firstName} ${user.lastName}
        Link: ${env.HOMEPAGE_URL}/activity/${post.id}`,
            })
          }

          await repository.updateStravaWebhookEventStatus(
            event.id,
            'COMPLETED',
          )
        } catch (e) {
          console.error(`Webhook activity delete failed:`, e)
          await repository.updateStravaWebhookEventStatus(event.id, 'ERRORED')
        }
      },
    )
    .with(
      { object_type: 'athlete', aspect_type: 'update' },
      async (athleteUpdateEvent) => {
        if (athleteUpdateEvent.updates.authorized === 'false') {
          await repository.deleteStravaSocialLogin(athleteUpdateEvent.owner_id)
          await createDiscordMessageFn({
            heading: 'Athlete Social Login Deleted (Webhook)',
            name: `${athleteUpdateEvent.owner_id}`,
            description: ``,
          })
        }
        await repository.updateStravaWebhookEventStatus(event.id, 'COMPLETED')
      },
    )
    .exhaustive()
  } catch (e) {
    console.error(`Webhook processing failed for event ${event.id}:`, e)
    await repository.updateStravaWebhookEventStatus(event.id, 'ERRORED')
  }
}
