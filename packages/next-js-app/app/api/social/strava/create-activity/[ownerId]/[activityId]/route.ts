import { PostType, StravaWebhookEventStatus } from '@prisma/client'
import { createDiscordMessage } from 'packages/services/discord'
import { fetchCompletePost } from 'packages/services/post/fetchComplete'
import { stringify } from 'packages/utils/utils'
import { repository } from '@trackfootball/database'
import invariant from 'tiny-invariant'
import { fetchStravaActivity } from 'services/strava/token'

export async function GET(
  req: Request,
  { params }: { params: { ownerId: string; activityId: string } },
) {
  const { ownerId: ownerIdParam, activityId: activityIdParam } = params

  const ownerId = parseInt(ownerIdParam)
  const activityId = parseInt(activityIdParam)

  if (isNaN(ownerId) || isNaN(activityId)) {
    return Response.json(
      { error: 'Invalid parameters: ownerId and activityId must be numbers' },
      { status: 400 },
    )
  }

  try {
    const user = await repository.getUserBy(stringify(ownerId))
    if (!user) {
      await createDiscordMessage({
        heading:
          'New Activity Creation Failed - No Social Login For User (Manual)',
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
    invariant(
      user,
      `invariant: failed to find user by strava owner_id ${ownerId}`,
    )

    const existingPostId = await repository.getPostIdBy(activityId)
    if (existingPostId) {
      await createDiscordMessage({
        heading: 'New Activity Creation Failed - Post Already Exists (Manual)',
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
    invariant(!existingPostId, `invariant: post already exists`)

    const activity = await fetchStravaActivity(activityId, user.id)

    const activityType = activity.type
    if (!activityType) {
      await createDiscordMessage({
        heading: 'New Activity Creation Failed - No Type (Manual)',
        name: `${ownerId}/${activityId}`,
        description: `
      Strava ID: ${activityId}
      Strava Owner: ${ownerId}
      Athlete Link: https://strava.com/athletes/${ownerId}
      Activity Link: https://strava.com/activities/${activityId}`,
      })
    }
    invariant(
      activityType,
      `invariant: activity must have a type, found ${activity.name} ${activity.type}`,
    )

    const isGeoDataAvailable =
      activity.start_latlng && activity.start_latlng.length > 0
    if (!isGeoDataAvailable) {
      await createDiscordMessage({
        heading: 'New Activity Creation Failed - No Geo Data (Manual)',
        name: `${ownerId}/${activityId}`,
        description: `
      Strava ID: ${activityId}
      Strava Owner: ${ownerId}
      Athlete Link: https://strava.com/athletes/${ownerId}
      Activity Link: https://strava.com/activities/${activityId}`,
      })
    }
    invariant(
      isGeoDataAvailable,
      `invariant: activity must geo data, found ${activity.start_latlng} ${activity.end_latlng}`,
    )

    if (!['Run', 'Soccer'].includes(activityType)) {
      return Response.json(
        { error: `Activity type ${activity.type} not supported` },
        { status: 400 },
      )
    }

    const activityName = activity.name
    invariant(activityName, 'invariant: activity must have a name')

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
      heading: 'New Activity Created (Manual)',
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
