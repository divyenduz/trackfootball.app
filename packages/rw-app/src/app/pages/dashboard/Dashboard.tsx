import { RequestInfo } from 'rwsdk/worker'
import { FeedContainer } from './FeedContainer'

export async function Dashboard({ ctx }: RequestInfo) {
  const feed = await ctx.repository.getFeed()
  const currentUser = ctx.user

  return (
    <>
      <title>Dashboard - Your Football Activity Feed | TrackFootball.app</title>
      <meta name="description" content="View your personalized football activity feed. Track your progress, see your friends' activities and discover new training insights on TrackFootball." />
      <FeedContainer
        initialPosts={feed.posts}
        initialNextCursor={feed.nextCursor}
        currentUser={currentUser}
      />
    </>
  )
}
