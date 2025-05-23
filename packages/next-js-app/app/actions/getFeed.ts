'use server'

import {
  getFeed as getFeedFromRepo,
  FeedItemType,
} from '@trackfootball/database'

export type { FeedItemType }

export async function getFeed(cursor: number = 0, limit: number = 3) {
  return getFeedFromRepo(cursor, limit)
}
