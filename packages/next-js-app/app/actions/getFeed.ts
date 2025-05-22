'use server'

import { Field, Post, User } from '@trackfootball/database'
import { FeatureCollection, LineString } from '@turf/helpers'
import { sql } from 'bun'

export type FeedItemType = Post & {
  geoJson: FeatureCollection<LineString>
  sprints: Array<FeatureCollection<LineString>>
  runs: Array<FeatureCollection<LineString>>
  Field: Field
  User: User
}

export async function getFeed(cursor: number = 0, limit: number = 3) {
  const maxPostIdQ: { max: number }[] = await sql`SELECT MAX("id") FROM "Post"`
  const maxPostId = maxPostIdQ[0].max

  const posts: FeedItemType[] = await sql`
    SELECT row_to_json("Field".*::"Field") as "Field", row_to_json("User".*::"User") as "User", "Post".* FROM "Post"
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
