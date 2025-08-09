import { RequestInfo } from 'rwsdk/worker'
import { FeedContainer } from './FeedContainer'

export async function Dashboard({ ctx }: RequestInfo) {
  const feed = await ctx.repository.getFeed()
  const currentUser = ctx.user

  return (
    <FeedContainer
      initialPosts={feed.posts}
      initialNextCursor={feed.nextCursor}
      currentUser={currentUser}
    />
  )
}
