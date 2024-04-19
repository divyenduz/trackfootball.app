// import { Alert, Skeleton } from '@mui/material'
// import { useRouter } from 'next/navigation'
// import React, { useEffect, useState } from 'react'
// import { match } from 'ts-pattern'
// import Button from '../../components/atoms/Button'
// import { ConnectWithStrava } from '../../components/atoms/brand/strava/ConnectWithStrava'
import { Field, Post, User } from '@trackfootball/database'
import { sql } from '@trackfootball/database'
import { redirect } from 'next/navigation'
import { auth } from 'utils/auth'

import { Feed } from '../../components/organisms/Feed/Feed'
import { FeatureCollection, LineString } from '@turf/helpers'

// import { useCheckStrava } from '../../hooks/social/checkStrava'
// import { Layout } from '../../layouts/Layout'
// import { trpc } from '../../packages/utils/trpcReact'

export const metadata = {
  title: 'Dashboard | TrackFootball',
}

type FeedItem = Post & {
  geoJson: FeatureCollection<LineString>
  sprints: Array<FeatureCollection<LineString>>
  runs: Array<FeatureCollection<LineString>>
  Field: Field
  User: User
}

export async function getFeed(cursor: number = 0, limit: number = 3) {
  const maxPostId = (
    await sql<{ max: number }[]>`SELECT MAX("id") FROM "Post"`
  )[0].max

  const posts = await sql<FeedItem[]>`
  SELECT row_to_json("Field".*::"Field") as "Field", row_to_json("User".*::"User") as "User", "Post".* FROM "Post"
  LEFT JOIN "Field" ON "Post"."fieldId" = "Field"."id"
  INNER JOIN "User" ON "Post"."userId" = "User"."id"
  WHERE "Post"."id" <= ${cursor || maxPostId}
  ORDER BY "Post"."startTime" DESC
  LIMIT ${limit + 1}
  `

  let nextCursor: typeof cursor | null = null
  const sortedPosts = posts.slice().sort((a, b) => b.id - a.id)
  if (sortedPosts.length > limit) {
    const nextItem = sortedPosts.pop()
    nextCursor = nextItem!.id
  }

  return { posts: sortedPosts, nextCursor }
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

  // const router = useRouter()
  // const [showLoadMore, setShowLoadMore] = useState(true)
  const feedQuery = await getFeed()
  const feed = feedQuery.posts

  // const feedQuery = trpc.useInfiniteQuery(
  //   [
  //     'user.feed',
  //     {
  //       limit: 3,
  //     },
  //   ],
  //   {
  //     getNextPageParam: (lastPage) => lastPage.nextCursor,
  //   }
  // )
  // useEffect(() => {
  //   if (!feedQuery.isLoading) {
  //     if (!feedQuery.hasNextPage) {
  //       setShowLoadMore(false)
  //     }

  //     setFeed(
  //       (feedQuery.data?.pages.flatMap((page) => {
  //         return page.posts
  //       }) || []) 
  //     )
  //   }
  // }, [feedQuery.isLoading, feedQuery.data])

  // const meQuery = trpc.useQuery(['app.me'])

  // useEffect(() => {
  //   if (meQuery.isLoading) {
  //     return
  //   }

  //   const user = meQuery.data?.user

  //   if (!user) {
  //     router.replace('/')
  //   }
  // }, [meQuery.isLoading])

  // const backendApiUrlQuery = trpc.useQuery(['system.backendApiUrl'], {
  //   ssr: true,
  // })

  // const { checkStravaState } = useCheckStrava()

  // if (feedQuery.isLoading) {
  //   return (
  //     <Layout pageTitle="Dashboard | TrackFootball">
  //       <Skeleton variant="rectangular" height={400}></Skeleton>
  //       <Skeleton variant="rectangular" height={400}></Skeleton>
  //     </Layout>
  //   )
  // }

  // if (feedQuery.error) {
  //   return (
  //     <Layout pageTitle="Dashboard | TrackFootball">
  //       {feedQuery.error?.message}
  //     </Layout>
  //   )
  // }

  // if (meQuery.error) {
  //   return (
  //     <Layout pageTitle="Dashboard | TrackFootball">
  //       {meQuery.error?.message}
  //     </Layout>
  //   )
  // }

  return (
    <>
      <>
        {/* {match(checkStravaState)
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
          ))} */}
      </>

      {feed.length > 0 && (
        <div className="w-full px-3 sm:px-5">
          <Feed feed={feed} />

          {/* {showLoadMore && (
            <Button
              onClick={() => {
                feedQuery.fetchNextPage()
              }}
            >
              Load More
            </Button>
          )} */}
        </div>
      )}
    </>
  )
}
