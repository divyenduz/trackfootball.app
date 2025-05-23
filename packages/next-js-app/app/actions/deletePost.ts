'use server'

import {
  deletePost as deletePostRepo,
  getPostRaw,
} from '@trackfootball/database'
import { MESSAGE_UNAUTHORIZED } from 'packages/auth/utils'
import invariant from 'tiny-invariant'
import { auth } from 'utils/auth'

export async function deletePost(postId: number) {
  const user = await auth()
  const post = await getPostRaw(postId)
  invariant(post, `invariant: post with ${postId} not found`)
  if (post?.userId !== user.id && user.type !== 'ADMIN') {
    throw new Error(MESSAGE_UNAUTHORIZED)
  }
  const deletePost = deletePostRepo(postId)
  return { post: deletePost }
}
