'use server'

import { Post, PostStatus, User, sql } from '@trackfootball/database'
import { Core } from '@trackfootball/sprint-detection'
import { durationToSeconds } from '@trackfootball/utils'
import { MESSAGE_UNAUTHORIZED } from 'packages/auth/utils'
import { postAddField } from 'packages/services/post/addField'
import { fetchStravaActivityGeoJson } from 'services/strava/token'
import { auth } from 'utils/auth'

export async function refreshPost(postId: number) {
  const user = await auth()

  const post = (
    await sql<Post[]>`
    SELECT * FROM "Post"
    WHERE "id" = ${postId}
    `
  )[0]

  if (post?.userId !== user.id && user.type !== 'ADMIN') {
    throw new Error(MESSAGE_UNAUTHORIZED)
  }

  const ownerUser = (
    await sql<User[]>`
  SELECT * FROM "User"
  WHERE "id" = ${post.userId}
  `
  )[0]

  const _key = parseInt(post.key)
  const geoJson = await fetchStravaActivityGeoJson(_key, ownerUser.id)

  if (geoJson instanceof Error) {
    throw geoJson
  }

  if (!geoJson) {
    throw new Error(`No geoJson found for Post id: ${postId}`)
  }
  const core = new Core(geoJson)

  const updatedPost = (
    await sql<Post[]>`
  UPDATE "Post"
  SET "geoJson" = ${geoJson as any},
  "totalDistance" = ${core.totalDistance()},
  "startTime" = ${new Date(core.getStartTime())},
  "elapsedTime" = ${durationToSeconds(core.elapsedTime())},
  "totalSprintTime" = ${durationToSeconds(core.totalSprintTime())},
  "sprints" = ${core.sprints() as any},
  "runs" = ${core.runs() as any},
  "maxSpeed" = ${core.maxSpeed()},
  "averageSpeed" = ${core.averageSpeed()},
  "status" = ${PostStatus.COMPLETED}
  WHERE "id" = ${postId}
  RETURNING *
  `
  )[0]

  await postAddField({
    postId: post.id,
  })

  return { post: updatedPost }
}
