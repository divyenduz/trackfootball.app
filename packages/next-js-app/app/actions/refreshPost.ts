'use server'

import { PostStatus, repository } from '@trackfootball/database'
import { fetchStravaActivityGeoJson } from '@trackfootball/service'
import { postAddField } from '@trackfootball/service/addField'
import { Core } from '@trackfootball/sprint-detection'
import { durationToSeconds } from '@trackfootball/utils'
import { MESSAGE_UNAUTHORIZED } from 'packages/auth/utils'
import invariant from 'tiny-invariant'
import { auth } from 'utils/auth'

export async function refreshPost(postId: number) {
  const user = await auth()
  invariant(user, 'invariant: refresh post called without user')

  const post = await repository.getPostById(postId)
  if (!post) {
    throw new Error(`Post with id ${postId} not found`)
  }

  if (post.userId !== user.id && user.type !== 'ADMIN') {
    throw new Error(MESSAGE_UNAUTHORIZED)
  }

  const ownerUser = await repository.getUserById(post.userId)
  if (!ownerUser) {
    throw new Error(`User with id ${post.userId} not found`)
  }

  const _key = parseInt(post.key)
  const geoJson = await fetchStravaActivityGeoJson(_key, ownerUser.id)

  if (geoJson instanceof Error) {
    throw geoJson
  }

  if (!geoJson) {
    throw new Error(`No geoJson found for Post id: ${postId}`)
  }
  const core = new Core(geoJson)

  const updatedPost = await repository.updatePostWithSprintData({
    id: postId,
    geoJson: geoJson as any,
    totalDistance: core.totalDistance(),
    startTime: new Date(core.getStartTime()),
    elapsedTime: durationToSeconds(core.elapsedTime()),
    totalSprintTime: durationToSeconds(core.totalSprintTime()),
    sprints: core.sprints() as any,
    runs: core.runs() as any,
    maxSpeed: core.maxSpeed(),
    averageSpeed: core.averageSpeed(),
    status: PostStatus.COMPLETED,
  })

  await postAddField({
    postId: post.id,
  })

  return { post: updatedPost }
}
