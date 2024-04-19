import { Field, Post, PostType, User } from '@prisma/client'
import { sql } from '@trackfootball/database'
import { FeatureCollection, LineString } from '@turf/helpers'

import { stringify } from '../packages/utils/utils'

interface CreatePostInput {
  type: PostType
  key: string
  text: string
  userId: number
}

export async function createPost(input: CreatePostInput) {
  const data = {
    ...input,
    updatedAt: sql`now()`,
  }

  const postQuery = sql<Post[]>`
      INSERT INTO "Post" ${
        //@ts-expect-error
        sql(data)
      }
      RETURNING *
      `

  const post = (await postQuery)[0]
  return post
}

async function getPostMeta(id: number) {
  const postMeta = (
    await sql<
      Array<{
        number_of_coordinates: number
        max_heart_rate: number
        average_heart_rate: number
        number_of_sprints: number
        number_of_runs: number
      }>
    >`
  SELECT
    jsonb_array_length("geoJson" -> 'features' -> 0 -> 'geometry' -> 'coordinates') as number_of_coordinates,
    jsonb_array_max("geoJson" -> 'features' -> 0 -> 'properties' -> 'heartRates') as max_heart_rate,
    jsonb_array_avg("geoJson" -> 'features' -> 0 -> 'properties' -> 'heartRates') as average_heart_rate,
    jsonb_array_length("Post"."sprints") as number_of_sprints,
    jsonb_array_length("Post"."runs") as number_of_runs
  FROM
      "Post"
  WHERE
      id = ${id};
    `
  )[0]

  return {
    numberOfCoordinates: postMeta?.number_of_coordinates || 0,
    maxHeartRate: postMeta?.max_heart_rate || 0,
    averageHeartRate: postMeta?.average_heart_rate || 0,
    numberOfSprints: postMeta?.number_of_sprints || 0,
    numberOfRuns: postMeta?.number_of_runs || 0,
  }
}

type TypedPost = Post & {
  geoJson: FeatureCollection<LineString>
  sprints: Array<FeatureCollection<LineString>>
  runs: Array<FeatureCollection<LineString>>
}

export async function getPost(id: number) {
  const post = (
    await sql<TypedPost[]>`
    SELECT * from "Post"
    WHERE "id" = ${id}
    `
  )[0]

  if (!post) {
    return null
  }

  const user = (
    await sql<Pick<User, 'id' | 'firstName' | 'lastName' | 'picture'>[]>`
    SELECT "id", "firstName", "lastName", "picture" from "User"
    WHERE "id" = ${post.userId}
    `
  )[0]

  const field = (
    await sql<Field[]>`
    SELECT * from "Field"
    WHERE "id" = ${post.fieldId}
    `
  )[0]

  const postWithData = {
    ...post,
    User: user,
    Field: field,
  }

  if (!postWithData) {
    return null
  }

  const postMeta = await getPostMeta(id)
  return {
    ...postWithData!,
    ...postMeta,
  }
}

export async function updatePostTitle(stravaId: number, title: string) {
  const post = (
    await sql<Post[]>`
    UPDATE "Post"
    SET "text" = ${title}
    WHERE "key" = ${stringify(stravaId)}
    RETURNING *
    `
  )[0]

  return post
}

export async function deletePostBy(stravaId: number): Promise<Post | null> {
  const key = `${stravaId}`
  const post = (
    await sql<Post[]>`
    DELETE FROM "Post"
    WHERE "key" = ${key}
    RETURNING *
    `
  )[0]

  return post
}
