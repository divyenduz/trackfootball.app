import { Post } from '@prisma/client'
import { sql } from '@trackfootball/database'
import { Core } from '@trackfootball/sprint-detection'
import { durationToSeconds } from '@trackfootball/utils'

import { postAddField } from './addField'
import { fetchStravaActivityGeoJson } from 'services/strava/token'

interface FetchCompletePostArgs {
  postId: number
}

export async function fetchCompletePost({ postId }: FetchCompletePostArgs) {
  {
    const post = (
      await sql<Post[]>`
        SELECT * FROM "Post"
        WHERE "id" = ${postId} AND "fieldId" IS NULL
        `
    )[0]

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
      post.userId
    )

    if (geoJson instanceof Error) {
      throw geoJson
    }

    if (!geoJson) {
      throw new Error(`No geoJson found for Post id: ${postId}`)
    }

    const core = new Core(geoJson)

    const updatedPost = (
      await sql<Post[]>`
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
    )[0]

    await postAddField({
      postId: post.id,
    })

    return { post: updatedPost }
  }
}
