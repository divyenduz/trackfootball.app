'use server'

import { repository } from '@trackfootball/database'
import { MESSAGE_UNAUTHORIZED } from 'packages/auth/utils'
import invariant from 'tiny-invariant'
import { auth } from 'utils/auth'

export async function deletePost(postId: number) {
  const user = await auth()
  invariant(user, 'delete post called without user')
  const post = await repository.getPost(postId)
  invariant(post, `post with ${postId} not found`)
  if (post.userId !== user.id && user.type !== 'ADMIN') {
    throw new Error(MESSAGE_UNAUTHORIZED)
  }
  const deletePost = repository.deletePost(postId)
  return { post: deletePost }
}
