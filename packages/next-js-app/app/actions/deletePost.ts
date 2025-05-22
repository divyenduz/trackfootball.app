'use server'

import { Post } from '@trackfootball/database'
import { sql } from 'bun'
import { MESSAGE_UNAUTHORIZED } from 'packages/auth/utils'
import { auth } from 'utils/auth'

export async function deletePost(postId: number) {
  const user = await auth()

  const posts: Post[] = await sql`
    SELECT * FROM "Post"
    WHERE "id" = ${postId}
    `
  const post = posts[0]

  if (post?.userId !== user.id && user.type !== 'ADMIN') {
    throw new Error(MESSAGE_UNAUTHORIZED)
  }

  const deletePosts: Post[] = await sql`
  DELETE FROM "Post"
  WHERE "id" = ${postId}
  RETURNING *
  `
  const deletePost = deletePosts[0]

  return { post: deletePost }
}
