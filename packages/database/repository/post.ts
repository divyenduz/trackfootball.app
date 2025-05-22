import { Field, Post, PostType, User } from '@prisma/client'
import { stringify } from '../../next-js-app/packages/utils/utils'
import { FeatureCollection, LineString } from '@turf/helpers'
import { sql } from 'bun'

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

  const posts: Post[] = await sql`
      INSERT INTO "Post" ${sql(data)}
      RETURNING *
      `

  const post = posts[0]
  return post
}

async function getPostMeta(id: number) {
  const postsMeta: Array<{
    number_of_coordinates: number
    max_heart_rate: number
    average_heart_rate: number
    number_of_sprints: number
    number_of_runs: number
  }> = await sql`
  WITH heart_rates AS (
    SELECT jsonb_array_elements_text("geoJson" -> 'features' -> 0 -> 'properties' -> 'heartRates')::int as heart_rate FROM "Post" WHERE id=${id}
  ),
  heart_rate_agg AS (
    SELECT max(heart_rate) AS max_heart_rate, floor(avg(heart_rate)) AS average_heart_rate FROM heart_rates
  ),
  post_data AS (
    SELECT
      jsonb_array_length("geoJson" -> 'features' -> 0 -> 'geometry' -> 'coordinates') as number_of_coordinates,
      jsonb_array_length("Post"."sprints") as number_of_sprints,
      jsonb_array_length("Post"."runs") as number_of_runs
    FROM "Post" WHERE id=${id}
  )
  SELECT max_heart_rate, average_heart_rate, number_of_coordinates, number_of_sprints, number_of_runs from heart_rate_agg, post_data;
    `
  const postMeta = postsMeta[0]

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
  const posts: TypedPost[] = await sql`
    SELECT * from "Post"
    WHERE "id" = ${id}
    `
  const post = posts[0]

  if (!post) {
    return null
  }

  const users: Array<Pick<User, 'id' | 'firstName' | 'lastName' | 'picture'>> =
    await sql`
    SELECT "id", "firstName", "lastName", "picture" from "User"
    WHERE "id" = ${post.userId}
    `
  const user = users[0]

  const fields: Field[] = await sql`
    SELECT * from "Field"
    WHERE "id" = ${post.fieldId}
    `
  const field = fields[0]

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

export async function getPostIdBy(stravaId: number) {
  const posts: TypedPost[] = await sql`
    SELECT * from "Post"
    WHERE "key" = ${stringify(stravaId)}
    `
  const post = posts[0]

  if (!post) {
    return null
  }

  return post.id
}

export async function updatePostTitle(stravaId: number, title: string) {
  const posts: Post[] = await sql`
    UPDATE "Post"
    SET "text" = ${title}
    WHERE "key" = ${stringify(stravaId)}
    RETURNING *
    `
  const post = posts[0]

  return post
}

export async function deletePostBy(stravaId: number): Promise<Post | null> {
  const key = `${stravaId}`
  const posts: Post[] = await sql`
    DELETE FROM "Post"
    WHERE "key" = ${key}
    RETURNING *
    `
  const post = posts[0]

  return post
}
