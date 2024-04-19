import { Metadata, ResolvingMetadata } from 'next'
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

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id

  const post = await getPost(parseInt(id))

  const homepageUrl = getHomepageUrl()

  const title = `${post?.text} | Activity | TrackFootball`
  const description = `${post?.text} is a Football activity on TrackFootball`
  const url = `${homepageUrl}/activity/${post?.id}`
  const openGraph = {
    title,
    description,
    type: 'website',
    url,
  }
  const twitter = {
    title,
    description,
    card: 'summary_large_image',
    site: '@_TrackFootball',
    creator: '@_TrackFootball',
    domain: 'trackfootball.app',
    url,
  }

  return {
    title,
    description,
    openGraph,
    twitter,
  }
}

export default async function Activity({ params: { id } }: Props) {
  const post = await getPost(parseInt(id))

  if (!post) {
    return notFound()
  }

  let user = null
  try {
    user = await auth()
  } catch (e) {
    console.error(e)
  }

  return (
    <>
      <div className="w-full max-w-4xl p-3 sm:p-5">
        <ActivityItem post={post} user={user}></ActivityItem>
      </div>
    </>
  )
}
