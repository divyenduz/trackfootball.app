// Import the Workflow definition
import {
  createRepository,
  serializeStravaWebhookEvent,
} from '@trackfootball/postgres'
import {
  WorkflowEntrypoint,
  WorkflowEvent,
  WorkflowStep,
} from 'cloudflare:workers'
import postgres from 'postgres'
import { match } from 'ts-pattern'
import {
  createDiscordMessage,
  fetchStravaActivity,
  StravaEvent,
  stringify,
} from '@trackfootball/service'
import type { PostType } from '@trackfootball/postgres'

type Params = {
  body: Record<string, unknown>
}

export class StravaWebhookCallbackWorkflow extends WorkflowEntrypoint<
  Env,
  Params
> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const stravaWebhookEvent = await step.do(
      'create strava webhook event',
      async () => {
        const sql = postgres(this.env.DATABASE_URL)
        const repository = createRepository(sql)
        const stravaWebhookEvent = await repository.createStravaWebhookEvent({
          status: 'PENDING',
          body: JSON.stringify(event.payload.body),
          errors: [],
        })
        return serializeStravaWebhookEvent(stravaWebhookEvent)
      },
    )

    const analyzedEvent = await step.do('detect type of event', async () => {
      const sql = postgres(this.env.DATABASE_URL)
      const repository = createRepository(sql)

      const stravaEvent: StravaEvent = JSON.parse(stravaWebhookEvent.body)

      const source = 'WEBHOOK'
      const objectType = stravaEvent.object_type
      const ownerId = stravaEvent.owner_id
      const objectId = stravaEvent.object_id

      const user = await repository.getUserBy(stringify(ownerId))

      let existingPost = null
      if (objectType === 'activity') {
        existingPost = await repository.getPostByStravaId(stravaEvent.object_id)
      }

      return {
        stravaWebhookEvent,
        stravaEvent,
        source,
        objectType,
        ownerId,
        objectId,
        existingPost,
        user,
      }
    })

    if (!analyzedEvent.user) {
      await step.do(
        'create discord message for missing user and remove event',
        async () => {
          const sql = postgres(this.env.DATABASE_URL)
          const repository = createRepository(sql)
          await createDiscordMessage({
            heading:
              'New Activity Update Failed - No Social Login For User (Update Webhook)',
            name: `${analyzedEvent.ownerId}/${analyzedEvent.objectId}`,
            description: `
        User has no Strava social login configured
        Strava Owner: ${analyzedEvent.ownerId}
        Activity ID: ${analyzedEvent.objectId}
        Athlete Link: https://strava.com/athletes/${analyzedEvent.ownerId}
        Activity Link: https://strava.com/activities/${analyzedEvent.objectId}`,
          })
          const existingWebhookEvent =
            await repository.findStravaWebhookEventByActivityId(
              analyzedEvent.objectId,
            )
          if (existingWebhookEvent) {
            await repository.updateStravaWebhookEventStatus(
              existingWebhookEvent.id,
              'COMPLETED',
            )
          }
        },
      )
      return
    }

    if (analyzedEvent.existingPost?.geoJson) {
      await step.do(
        'create discord message for existing post and remove event',
        async () => {
          const sql = postgres(this.env.DATABASE_URL)
          const repository = createRepository(sql)
          await createDiscordMessage({
            heading: `New Activity Creation Failed - Post Already Exists (${analyzedEvent.source})`,
            name: `${analyzedEvent.ownerId}/${analyzedEvent.objectId}`,
            description: `
            Strava ID: ${analyzedEvent.objectId}
            Strava Owner: ${analyzedEvent.ownerId}
            Athlete Link: https://strava.com/athletes/${analyzedEvent.ownerId}
            Activity Link: https://strava.com/activities/${analyzedEvent.objectId}
            Link: ${this.env.HOMEPAGE_URL}/activity/${analyzedEvent.existingPost?.id}`,
          })
          const existingWebhookEvent =
            await repository.findStravaWebhookEventByActivityId(
              analyzedEvent.objectId,
            )
          if (existingWebhookEvent) {
            await repository.updateStravaWebhookEventStatus(
              existingWebhookEvent.id,
              'COMPLETED',
            )
          }
        },
      )
      return
    }

    await match(analyzedEvent.stravaEvent)
      .with(
        { object_type: 'activity', aspect_type: 'create' },
        async (activityCreateEvent) => {
          const stravaActivity = await step.do(
            'fetch strava activity',
            async () => {
              const sql = postgres(this.env.DATABASE_URL)
              const repository = createRepository(sql)
              const activity = await fetchStravaActivity(
                repository,
                activityCreateEvent.object_id,
                activityCreateEvent.owner_id,
              )
              return activity
            },
          )

          if (!stravaActivity.type) {
            await step.do('create discord event for no type', async () => {
              const sql = postgres(this.env.DATABASE_URL)
              const repository = createRepository(sql)
              await createDiscordMessage({
                heading: `New Activity Creation Failed - No Type (${analyzedEvent.source})`,
                name: `${analyzedEvent.ownerId}/${analyzedEvent.objectId}`,
                description: `
      Strava ID: ${analyzedEvent.objectId}
      Strava Owner: ${analyzedEvent.ownerId}
      Athlete Link: https://strava.com/athletes/${analyzedEvent.ownerId}
      Activity Link: https://strava.com/activities/${analyzedEvent.objectId}`,
              })
              const existingWebhookEvent =
                await repository.findStravaWebhookEventByActivityId(
                  analyzedEvent.objectId,
                )
              if (existingWebhookEvent) {
                await repository.deleteStravaWebhookEvent(
                  existingWebhookEvent.id,
                )
              }
              return
            })
          }

          if (!['Run', 'Soccer'].includes(stravaActivity.type || '')) {
            await step.do('', async () => {
              const sql = postgres(this.env.DATABASE_URL)
              const repository = createRepository(sql)
              await createDiscordMessage({
                heading: `New Activity Creation Failed - Type Not Supported ${stravaActivity.type} (${analyzedEvent.source})`,
                name: `${analyzedEvent.ownerId}/${analyzedEvent.objectId}`,
                description: `
      Strava ID: ${analyzedEvent.objectId}
      Strava Owner: ${analyzedEvent.ownerId}
      Athlete Link: https://strava.com/athletes/${analyzedEvent.ownerId}
      Activity Link: https://strava.com/activities/${analyzedEvent.objectId}`,
              })

              const existingWebhookEvent =
                await repository.findStravaWebhookEventByActivityId(
                  analyzedEvent.objectId,
                )
              if (existingWebhookEvent) {
                await repository.deleteStravaWebhookEvent(
                  existingWebhookEvent.id,
                )
              }
            })
            return
          }

          const isGeoDataAvailable = Boolean(stravaActivity.map?.polyline)
          if (!isGeoDataAvailable) {
            step.do('create discord message for no geo data', async () => {
              const sql = postgres(this.env.DATABASE_URL)
              const repository = createRepository(sql)

              await createDiscordMessage({
                heading: `New Activity Creation Failed - No Geo Data (${analyzedEvent.source})`,
                name: `${analyzedEvent.ownerId}/${analyzedEvent.objectId}`,
                description: `
      Strava ID: ${analyzedEvent.objectId}
      Strava Owner: ${analyzedEvent.ownerId}
      Athlete Link: https://strava.com/athletes/${analyzedEvent.ownerId}
      Activity Link: https://strava.com/activities/${analyzedEvent.objectId}`,
              })
              const existingWebhookEvent =
                await repository.findStravaWebhookEventByActivityId(
                  analyzedEvent.objectId,
                )
              if (existingWebhookEvent) {
                await repository.deleteStravaWebhookEvent(
                  existingWebhookEvent.id,
                )
              }
            })
            return
          }

          await step.do('handle create activity event', async () => {
            const sql = postgres(this.env.DATABASE_URL)
            const repository = createRepository(sql)
            const data = {
              type: 'STRAVA_ACTIVITY' as PostType,
              key: stringify(analyzedEvent.objectId),
              text: stravaActivity.name!,
              userId: analyzedEvent?.user?.id!,
            }

            const post = await repository.createPost(data)
            if (!post) {
              throw new Error(
                `Failed to create post for activity ${analyzedEvent.objectId}`,
              )
            }
            console.log('created post with post id', post.id)
            return post
          })
        },
      )
      .with(
        { object_type: 'activity', aspect_type: 'update' },
        async (activityUpdateEvent) => {
          console.log('handle activity update', activityUpdateEvent)
          // await step.do('handle update activity event', () => {})
        },
      )
      .with(
        { object_type: 'activity', aspect_type: 'delete' },
        async (activityDeleteEvent) => {
          console.log('handle activity delete', activityDeleteEvent)
          // await step.do('handle delete activity event', () => {})
        },
      )
      .with(
        { object_type: 'athlete', aspect_type: 'update' },
        async (athleteUpdateEvent) => {
          console.log('handle athlete update', athleteUpdateEvent)
          // await step.do('handle athlete update event', () => {})
        },
      )
      .exhaustive()
  }
}
