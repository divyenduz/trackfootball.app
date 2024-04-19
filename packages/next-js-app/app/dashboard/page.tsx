import { getFeed } from 'app/actions/getFeed'
import { redirect } from 'next/navigation'
import { auth } from 'utils/auth'

import Feed from './Feed'

export const metadata = {
  title: 'Dashboard | TrackFootball',
}

export default async function Home() {
  let user = null
  try {
    user = await auth()
  } catch (e) {
    console.error(e)
  }
  if (!user) {
    // Note: not logged in, redirect to home page!
    redirect('/')
  }

  const feedQuery = await getFeed()
  const feed = feedQuery.posts
  const nextCursor = feedQuery.nextCursor

  return (
    <div className="w-full max-w-4xl">
      {feed.length > 0 && (
        <div className="w-full px-3 sm:px-5">
          <Feed initialFeed={feed} initialNextCursor={nextCursor} />
        </div>
      )}
    </div>
  )
}
