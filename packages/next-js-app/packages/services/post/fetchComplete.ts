import { Post } from '@prisma/client'
import { Core } from '@trackfootball/sprint-detection'
import { durationToSeconds } from '@trackfootball/utils'

import { postAddField } from './addField'
import { fetchStravaActivityGeoJson } from 'services/strava/token'
import { sql } from 'bun'

interface FetchCompletePostArgs {
  postId: number
}

export async function fetchCompletePost({ postId }: FetchCompletePostArgs) {
  {
    const posts = await sql`
        SELECT * FROM "Post"
        WHERE "id" = ${postId} AND "fieldId" IS NULL
        `
    const post = posts[0]

    if (!post) {
      console.error(`post.fetchComplete: post ${postId} not found`)
      return
    }

    await sql`
        UPDATE "Post"
        SET "status" = 'PROCESSING'
        WHERE "id" = ${post.id}
        `

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

    const updatedPosts: Post[] = await sql`
        WITH PostModified AS (
          UPDATE "Post"
          SET "status" = 'COMPLETED',
          "geoJson" = ${geoJson as any},
          "totalDistance" = ${core.totalDistance()},
          "startTime" = ${new Date(core.getStartTime())},
          "elapsedTime" = ${durationToSeconds(core.elapsedTime())},
          "totalSprintTime" = ${durationToSeconds(core.totalSprintTime())},
          "sprints" = ${core.sprints() as any},
          "runs" = ${core.runs() as any},
          "maxSpeed" = ${core.maxSpeed()},
          "averageSpeed" = ${core.averageSpeed()}
          WHERE "id" = ${post.id}
          RETURNING
            *
        )
        SELECT
          *
        FROM
          "Post"
        `
    const updatedPost = updatedPosts[0]

    await postAddField({
      postId: post.id,
    })

    return { post: updatedPost }
  }
}
