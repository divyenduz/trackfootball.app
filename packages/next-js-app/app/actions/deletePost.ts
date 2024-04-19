'use server'

import { Post, sql } from '@trackfootball/database'
import { MESSAGE_UNAUTHORIZED } from 'packages/auth/utils'
import { auth } from 'utils/auth'

export async function deletePost(postId: number) {
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

  const deletePost = (
    await sql<Post[]>`
  DELETE FROM "Post"
  WHERE "id" = ${postId}
  RETURNING *
  `
  )[0]

  return { post: deletePost }
}
