'use server'

import { Field, Post, User, sql } from '@trackfootball/database'
import { FeatureCollection, LineString } from '@turf/helpers'

export type FeedItemType = Post & {
  Field: Field
  User: User
  // Stats instead of heavy geoJson data
  distance?: number
  duration?: number
  avgSpeed?: number
  maxSpeed?: number
  sprintCount?: number
}

export async function getFeed(cursor: number = 0, limit: number = 3) {
  const maxPostId = (
    await sql<{ max: number }[]>`SELECT MAX("id") FROM "Post"`
  )[0].max

  const posts = await sql<FeedItemType[]>`
    SELECT 
      row_to_json("Field".*::"Field") as "Field", 
      row_to_json("User".*::"User") as "User", 
      "Post".id, 
      "Post".text, 
      "Post"."userId", 
      "Post"."fieldId", 
      "Post"."startTime",
      "Post"."totalDistance" as distance,
      "Post"."elapsedTime" as duration,
      CASE WHEN "Post"."totalDistance" > 0 AND "Post"."elapsedTime" > 0 
        THEN ("Post"."totalDistance" / "Post"."elapsedTime") * 3.6 
        ELSE NULL 
      END as "avgSpeed",
      "Post"."maxSpeed",
      CASE WHEN "Post".sprints IS NOT NULL 
        THEN (SELECT COUNT(*) FROM jsonb_array_elements("Post".sprints) as sprints) 
        ELSE 0 
      END as "sprintCount"
    FROM "Post"
    LEFT JOIN "Field" ON "Post"."fieldId" = "Field"."id"
    INNER JOIN "User" ON "Post"."userId" = "User"."id"
    WHERE "Post"."id" <= ${cursor || maxPostId}
    ORDER BY "Post"."startTime" DESC
    LIMIT ${limit + 1}
    `

  let nextCursor: typeof cursor | null = null
  if (posts.length > limit) {
    const nextItem = posts.pop()
    nextCursor = nextItem!.id
  }

  return { posts, nextCursor }
}
