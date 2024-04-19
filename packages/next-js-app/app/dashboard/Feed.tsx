'use client'

import { Button } from '@mui/material'
import { getFeed } from 'app/actions/getFeed'
import { FeedItem } from 'components/organisms/Feed/FeedItem'
import next from 'next'
import { useState } from 'react'

import { FeedItemType } from './page'

export const metadata = {
  title: 'Dashboard | TrackFootball',
}

interface Props {
  initialFeed: Array<FeedItemType>
  initialNextCursor?: number | null
}

// export type FeedPost = Awaited<ReturnType<typeof getFeed>>['posts'][0]
// export type FullPost = NonNullable<Awaited<ReturnType<typeof getPost>>>
// export type AwaitedPost = FeedPost | FullPost

export default function Feed({ initialFeed, initialNextCursor }: Props) {
  const [feed, setFeed] = useState(initialFeed)
  const [nextCursor, setNextCursor] = useState(initialNextCursor)
  const [loading, setLoading] = useState(false)
  const [showLoadMore, setShowLoadMore] = useState(true)

  return (
    <>
      {feed.length > 0 && (
        <div className="w-full px-3 sm:px-5">
          {feed.map((post) => {
            return <FeedItem key={post.id} post={post}></FeedItem>
          })}
        </div>
      )}

      {showLoadMore && (
        <Button
          onClick={async () => {
            setLoading(true)
            const nextPage = await getFeed(nextCursor || 0)
            setFeed([...feed, ...nextPage.posts])
            if (nextPage.posts.length === 0 || nextPage.nextCursor === null) {
              setShowLoadMore(false)
            }
            if (nextPage.nextCursor) {
              setNextCursor(nextPage.nextCursor)
            }
          }}
        >
          Load More
        </Button>
      )}
    </>
  )
}
