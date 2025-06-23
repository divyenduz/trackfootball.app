'use server'

import { requestInfo } from 'rwsdk/worker'

export async function getFeed(cursor: number) {
  const { ctx } = requestInfo
  const feed = await ctx.repository.getFeed(cursor, 10)
  return feed
}
