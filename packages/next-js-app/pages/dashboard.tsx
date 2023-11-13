import { Alert, Skeleton } from '@mui/material'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { match } from 'ts-pattern'

import Button from '../components/atoms/Button'
import { ConnectWithStrava } from '../components/atoms/brand/strava/ConnectWithStrava'
import { Feed } from '../components/organisms/Feed/Feed'
import { FeedItemFeedPost } from '../components/organisms/Feed/FeedItem'
import { useCheckStrava } from '../hooks/social/checkStrava'
import { Layout } from '../layouts/Layout'
import { trpc } from '../packages/utils/trpcReact'

export default function Home() {
  const router = useRouter()
  const [showLoadMore, setShowLoadMore] = useState(true)
  const [feed, setFeed] = useState<FeedItemFeedPost[]>([])

  const feedQuery = trpc.useInfiniteQuery(
    [
      'user.feed',
      {
        limit: 3,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )
  useEffect(() => {
    if (!feedQuery.isLoading) {
      if (!feedQuery.hasNextPage) {
        setShowLoadMore(false)
      }

      setFeed(
        (feedQuery.data?.pages.flatMap((page) => {
          return page.posts
        }) || []) as unknown as FeedItemFeedPost[]
      )
    }
  }, [feedQuery.isLoading, feedQuery.data])

  const meQuery = trpc.useQuery(['app.me'])

  useEffect(() => {
    if (meQuery.isLoading) {
      return
    }

    const user = meQuery.data?.user

    if (!user) {
      router.replace('/')
    }
  }, [meQuery.isLoading])

  const backendApiUrlQuery = trpc.useQuery(['system.backendApiUrl'], {
    ssr: true,
  })

  const { checkStravaState } = useCheckStrava()

  if (feedQuery.isLoading) {
    return (
      <Layout pageTitle="Dashboard | TrackFootball">
        <Skeleton variant="rectangular" height={400}></Skeleton>
        <Skeleton variant="rectangular" height={400}></Skeleton>
      </Layout>
    )
  }

  if (feedQuery.error) {
    return (
      <Layout pageTitle="Dashboard | TrackFootball">
        {feedQuery.error?.message}
      </Layout>
    )
  }

  if (meQuery.error) {
    return (
      <Layout pageTitle="Dashboard | TrackFootball">
        {meQuery.error?.message}
      </Layout>
    )
  }

  return (
    <Layout pageTitle="Dashboard | TrackFootball">
      <>
        {match(checkStravaState)
          .with('NOT_WORKING', 'NOT_CONNECTED', () => (
            <>
              <Alert severity="error">
                <p>
                  TrackFootball&apos;s is not connected to Strava, please
                  connect it using this button. Strava Football/Run activities
                  will be synced automatically.
                </p>
                <ConnectWithStrava
                  callbackUrl={`${backendApiUrlQuery.data?.backendApiUrl}/social/strava/callback`}
                ></ConnectWithStrava>
                <p>Having trouble? Please contact singh@trackfootball.app</p>
              </Alert>
              <div style={{ margin: 30 }}></div>
            </>
          ))
          .otherwise(() => (
            <></>
          ))}
      </>

      {feed.length > 0 && (
        <div className="w-full px-3 sm:px-5">
          <Feed feed={feed} />

          {showLoadMore && (
            <Button
              onClick={() => {
                feedQuery.fetchNextPage()
              }}
            >
              Load More
            </Button>
          )}
        </div>
      )}
    </Layout>
  )
}
