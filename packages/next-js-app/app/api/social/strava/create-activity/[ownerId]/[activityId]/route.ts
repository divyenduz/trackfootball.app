import { PostType } from '@prisma/client'
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
    invariant(user, 'invariant: disconnect strava called without user')

    const activity = await fetchStravaActivity(activityId, user.id)
    const activityType = activity.type
    invariant(activityType, 'invariant: activity must have a type')

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
