'use server'

import {
  getContenderFields,
  type FieldContender,
} from '@trackfootball/service/getContenderFields'
import invariant from 'tiny-invariant'
import { auth } from 'utils/auth'

export async function getContenderFieldsAction(
  postId: number,
): Promise<FieldContender[]> {
  const user = await auth()
  invariant(user, `assignField called without a user`)
  if (user?.type !== 'ADMIN') {
    invariant(
      false,
      `assignField called by non-admin user: ${user.id} ${user.type}`,
    )
  }
  try {
    return await getContenderFields({ postId })
  } catch (error) {
    console.error('Error getting contender fields:', error)
    return []
  }
}
