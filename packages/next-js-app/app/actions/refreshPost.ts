'use server'

import { Post, PostStatus, User } from '@trackfootball/database'
import { Core } from '@trackfootball/sprint-detection'
import { durationToSeconds } from '@trackfootball/utils'
import { sql } from 'bun'
import { MESSAGE_UNAUTHORIZED } from 'packages/auth/utils'
import { postAddField } from 'packages/services/post/addField'
import { fetchStravaActivityGeoJson } from 'services/strava/token'
import { auth } from 'utils/auth'

export async function refreshPost(postId: number) {
  const user = await auth()

  const posts: Post[] = await sql`
    SELECT * FROM "Post"
    WHERE "id" = ${postId}
    `
  const post = posts[0]

  if (post?.userId !== user.id && user.type !== 'ADMIN') {
    throw new Error(MESSAGE_UNAUTHORIZED)
  }

  const ownerUsers: User[] = await sql`
  SELECT * FROM "User"
  WHERE "id" = ${post.userId}
  `
  const ownerUser = ownerUsers[0]

  const _key = parseInt(post.key)
  const geoJson = await fetchStravaActivityGeoJson(_key, ownerUser.id)

  if (geoJson instanceof Error) {
    throw geoJson
  }

  if (!geoJson) {
    throw new Error(`No geoJson found for Post id: ${postId}`)
  }
  const core = new Core(geoJson)

  const updatedPosts: Post[] = await sql`
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
  const updatedPost = updatedPosts[0]

  await postAddField({
    postId: post.id,
  })

  return { post: updatedPost }
}
