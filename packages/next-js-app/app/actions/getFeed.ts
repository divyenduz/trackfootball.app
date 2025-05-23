'use server'

import { repository } from '@trackfootball/database'
import type { FeedItemType } from '@trackfootball/database/repository/post'

export type { FeedItemType }

export async function getFeed(cursor: number = 0, limit: number = 3) {
  return repository.getFeed(cursor, limit)
}
