import { RequestInfo } from 'rwsdk/worker'
import { FeedContainer } from './FeedContainer'

export async function Dashboard({ ctx }: RequestInfo) {
  const feed = await ctx.repository.getFeed()

  return (
    <FeedContainer
      initialPosts={feed.posts}
      initialNextCursor={feed.nextCursor}
    />
  )
}
