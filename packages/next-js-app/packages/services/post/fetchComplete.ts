import { Core } from '@trackfootball/sprint-detection'
import { durationToSeconds } from '@trackfootball/utils'
import {
  getPostByIdWithoutField,
  updatePostStatus,
  updatePostComplete,
} from '@trackfootball/database/repository/post'

import { postAddField } from './addField'
import { fetchStravaActivityGeoJson } from 'services/strava/token'

interface FetchCompletePostArgs {
  postId: number
}

export async function fetchCompletePost({ postId }: FetchCompletePostArgs) {
  {
    const post = await getPostByIdWithoutField(postId)

    if (!post) {
      console.error(`post.fetchComplete: post ${postId} not found`)
      return
    }

    await updatePostStatus(post.id, 'PROCESSING')

    const geoJson = await fetchStravaActivityGeoJson(
      parseInt(post.key),
      post.userId,
    )

    if (geoJson instanceof Error) {
      throw geoJson
    }

    if (!geoJson) {
      throw new Error(`No geoJson found for Post id: ${postId}`)
    }

    const core = new Core(geoJson)

    const updatedPost = await updatePostComplete({
      id: post.id,
      geoJson: geoJson as any,
      totalDistance: core.totalDistance(),
      startTime: new Date(core.getStartTime()),
      elapsedTime: durationToSeconds(core.elapsedTime()),
      totalSprintTime: durationToSeconds(core.totalSprintTime()),
      sprints: core.sprints() as any,
      runs: core.runs() as any,
      maxSpeed: core.maxSpeed(),
      averageSpeed: core.averageSpeed(),
    })

    await postAddField({
      postId: post.id,
    })

    return { post: updatedPost }
  }
}
