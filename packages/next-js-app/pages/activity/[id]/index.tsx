import { sql } from '@trackfootball/database'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { GetStaticPropsContext } from 'next/types'
import React from 'react'

import ActivityItem from '../../../components/organisms/Activity/ActivityItem'
import { FeedItemFeedPost } from '../../../components/organisms/Feed/FeedItem'
import { Layout } from '../../../layouts/Layout'
import { trpc } from '../../../packages/utils/trpcReact'
import { ensurePost } from '../../../packages/utils/utils'
import { GetPostRouterResponse } from '../../../pages/api/trpc/queries/getPost'
import { getPost } from '../../../repository/post'

type Props = {
  post: GetPostRouterResponse
}

// https://github.com/vercel/next.js/issues/18705#issuecomment-809476997
// type Props = InferGetStaticPropsType<typeof getStaticProps>

export default function Activity({ post }: Props /**/) {
  const router = useRouter()
  const trpcContext = trpc.useContext()

  const deletePost = trpc.useMutation('post.delete')
  const refreshPost = trpc.useMutation('post.refresh')

  const backendApiUrlQuery = trpc.useQuery(['system.backendApiUrl'], {
    ssr: true,
  })
  const backendApiUrl = backendApiUrlQuery.data?.backendApiUrl

  const homepageUrlQuery = trpc.useQuery(['system.homepageUrl'], {
    ssr: true,
  })
  const homepageUrl =
    homepageUrlQuery.data?.homepageUrl || 'https://trackfootball.app'

  if (router.isFallback) {
    return <Layout>Loading...</Layout>
  }

  if (!ensurePost(post)) {
    return (
      <Layout pageTitle={`Not Found | TrackFootball`}>
        404 - Activity Not found
      </Layout>
    )
  }

  const postTitle = `${post.text} | Activity | TrackFootball`
  const postDescription = `${post.text} is a Football activity on TrackFootball`

  return (
    <Layout pageTitle={postTitle}>
      <Head>
        <title>{postTitle}</title>
        <meta name="description" content={postDescription}></meta>

        <meta
          property="og:url"
          content={`${homepageUrl}/activity/${post.id}`}
        ></meta>
        <meta property="og:type" content="website"></meta>
        <meta property="og:title" content={postTitle}></meta>
        <meta property="og:description" content={postDescription}></meta>

        <meta name="twitter:card" content="summary_large_image"></meta>
        <meta name="twitter:site" content="@_TrackFootball"></meta>
        <meta name="twitter:creator" content="@_TrackFootball"></meta>
        <meta property="twitter:domain" content="trackfootball.app"></meta>
        <meta
          property="twitter:url"
          content={`${homepageUrl}/activity/${post.id}`}
        ></meta>
        <meta name="twitter:title" content={postTitle}></meta>
        <meta name="twitter:description" content={postDescription}></meta>
      </Head>
      <div className="w-full p-3 sm:p-5">
        <ActivityItem
          post={post as unknown as FeedItemFeedPost}
          onRefresh={async () => {
            await refreshPost.mutateAsync({
              postId: post.id,
            })
            trpcContext.invalidateQueries(['app.getPost'])
          }}
          onDelete={async () => {
            const rc = confirm(
              'Are you sure that you want to delete this activity? This cannot be undone.'
            )
            if (!rc) {
              return
            }
            try {
              const r = await deletePost.mutateAsync({
                postId: post.id,
              })
              router.replace('/dashboard')
            } catch (e) {
              console.error(e)
              alert(
                `Something went wrong, please contact singh@trackfootball.app` +
                e
              )
            }
          }}
        ></ActivityItem>
      </div>
    </Layout>
  )
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const id = params?.id as string
  const post = await getPost(parseInt(id))

  if (!Boolean(post)) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      post: JSON.parse(JSON.stringify(post)),
    },
    revalidate: 10,
  }
}

export async function getStaticPaths() {
  return { paths: [], fallback: true }
}
