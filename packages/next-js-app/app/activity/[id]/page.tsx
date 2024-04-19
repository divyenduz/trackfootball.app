import Head from 'next/head'
import { notFound } from 'next/navigation'
import { auth } from 'utils/auth'

import ActivityItem from '../../../components/organisms/Activity/ActivityItem'
import { getPost } from '../../../repository/post'

type Props = {
  params: {
    id: string
  }
}

export function getHomepageUrl() {
  const url = process.env.HOMEPAGE_URL || 'https://trackfootball.app'
  return url
}

// https://github.com/vercel/next.js/issues/18705#issuecomment-809476997
// type Props = InferGetStaticPropsType<typeof getStaticProps>

export default async function Activity({ params: { id } }: Props) {
  const post = await getPost(parseInt(id))
  const homepageUrl = getHomepageUrl()

  if (!post) {
    return notFound()
  }

  let user = null
  try {
    user = await auth()
  } catch (e) {
    console.error(e)
  }

  const postTitle = `${post.text} | Activity | TrackFootball`
  const postDescription = `${post.text} is a Football activity on TrackFootball`
  // pageTitle={postTitle}

  return (
    <>
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
        <ActivityItem post={post} user={user}></ActivityItem>
      </div>
    </>
  )
}
