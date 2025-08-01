import { buildCommand } from '@stricli/core'
import { createRepository } from '@trackfootball/postgres'
import { CLI_NAME } from 'src/constants'

import { LocalContext } from 'src/context'
import invariant from 'tiny-invariant'
import postgres from 'postgres'
import { fetchCompletePost, fetchStravaActivity } from '@trackfootball/service'

type Flags = {}

export const help = `${CLI_NAME} list | list all projects on the system with their path`

export async function cmd(
  this: LocalContext,
  {}: Flags,
  activityIdArg: string
) {
  const activityId = parseInt(activityIdArg)
  invariant(process.env.DATABASE_URL, 'DATABASE_URL must be set')
  const sql = postgres(process.env.DATABASE_URL)
  const repository = await createRepository(sql)
  const activity = await repository.getPostById(activityId)
  invariant(activity, `Activity with id ${activityId} not found`)
  try {
    console.log(activity)
    const user = await repository.getUser(activity.userId)
    invariant(user, `User not found for activity with id ${activityId}`)

    const stravaActivity = await fetchStravaActivity(
      repository,
      parseInt(activity.key),
      user.id
    )
    invariant(
      stravaActivity,
      `Strava activity not found for activity with id ${activityId}`
    )
    console.log(stravaActivity)

    const activityType = stravaActivity.type
    invariant(
      activityType,
      `Activity with id ${activityId} has no type, found ${stravaActivity.type}`
    )

    const isGeoDataAvailable = Boolean(stravaActivity.map?.polyline)
    invariant(isGeoDataAvailable, `activity must have geo data`)

    if (!['Run', 'Soccer'].includes(activityType)) {
      invariant(
        false,
        `Activity type ${activityType} not supported for activity with id ${activityId}`
      )
    }

    const activityName = stravaActivity.name
    invariant(activityName, 'activity must have a name')

    await fetchCompletePost(repository, {
      postId: activity.id,
    })
    const updatedPost = await repository.getPostWithUserAndFields(activity.id)
    invariant(
      updatedPost,
      `Updated post not found for activity with id ${activityId}`
    )

    const existingWebhookEvent =
      await repository.findStravaWebhookEventByActivityId(
        parseInt(activity.key)
      )
    if (existingWebhookEvent) {
      await repository.updateStravaWebhookEventStatus(
        existingWebhookEvent.id,
        'COMPLETED'
      )
    }

    console.log(
      `Activity with id ${updatedPost.id} has been refreshed successfully`
    )
  } catch (e) {
    console.error(e)
    const existingWebhookEvent =
      await repository.findStravaWebhookEventByActivityId(
        parseInt(activity.key)
      )
    console.log(existingWebhookEvent)
    if (existingWebhookEvent) {
      await repository.deleteStravaWebhookEvent(existingWebhookEvent.id)
    }
  } finally {
    sql.end()
  }
}

export const ActivityRefreshCommand = buildCommand({
  docs: {
    brief: help,
  },
  parameters: {
    flags: {},
    positional: {
      kind: 'tuple',
      parameters: [
        {
          brief: 'activity id to refresh',
          parse: String,
        },
      ],
    },
  },
  func: cmd,
})
