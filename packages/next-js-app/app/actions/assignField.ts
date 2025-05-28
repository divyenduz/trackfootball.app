'use server'

import { repository } from '@trackfootball/database'
import { revalidatePath } from 'next/cache'
import invariant from 'tiny-invariant'
import { auth } from 'utils/auth'

export async function assignField(postId: number, fieldId: number) {
  const user = await auth()
  invariant(user, `assignField called without a user`)
  if (user?.type !== 'ADMIN') {
    invariant(
      false,
      `assignField called by non-admin user: ${user.id} ${user.type}`,
    )
  }
  try {
    const updatedPost = await repository.updatePostFieldId(postId, fieldId)

    if (updatedPost) {
      revalidatePath(`/activity/${postId}`)
      revalidatePath('/dashboard')
      return { success: true }
    } else {
      return { success: false, error: 'Failed to update post' }
    }
  } catch (error) {
    console.error('Error assigning field:', error)
    return { success: false, error: 'An error occurred while assigning field' }
  }
}
