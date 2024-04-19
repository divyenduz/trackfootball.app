import { Field, Post, User } from '@trackfootball/database'
import { sql } from '@trackfootball/database'
import { FeatureCollection, LineString } from '@turf/helpers'
import { getFeed } from 'app/actions/getFeed'
import { redirect } from 'next/navigation'
import { auth } from 'utils/auth'

import Feed from './Feed'

export const metadata = {
  title: 'Dashboard | TrackFootball',
}

export type FeedItemType = Post & {
  geoJson: FeatureCollection<LineString>
  sprints: Array<FeatureCollection<LineString>>
  runs: Array<FeatureCollection<LineString>>
  Field: Field
  User: User
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
    <>
      {feed.length > 0 && (
        <div className="w-full px-3 sm:px-5">
          <Feed initialFeed={feed} initialNextCursor={nextCursor} />
        </div>
      )}
    </>
  )
}
