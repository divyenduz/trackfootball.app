'use server'

import { Post, sql } from '@trackfootball/database'
import { revalidatePath } from 'next/cache'
import { MESSAGE_UNAUTHORIZED } from 'packages/auth/utils'
import { auth } from 'utils/auth'
import { z } from 'zod'

import { FormValidationFailedError } from './actions'

const schema = z.object({
  postId: z.number().nonnegative(),
})

export async function deletePost(formData: FormData) {
  const validatedFields = schema.safeParse({
    postId: formData.get('postId'),
  })

  if (!validatedFields.success) {
    throw new FormValidationFailedError(
      JSON.stringify(validatedFields.error.flatten().fieldErrors)
    )
  }

  const { postId } = validatedFields.data

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
