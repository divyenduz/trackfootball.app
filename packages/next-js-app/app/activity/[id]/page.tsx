import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from 'utils/auth'

import ActivityItem from '../../../components/organisms/Activity/ActivityItem'
import { repository } from '@trackfootball/database'

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function getHomepageUrl() {
  const url = process.env.HOMEPAGE_URL || 'https://trackfootball.app'
  return url
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = params.id

  const post = await repository.getPostWithUserAndFields(parseInt(id))

  const homepageUrl = await getHomepageUrl()

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

export default async function Activity(props: Props) {
  const params = await props.params;

  const {
    id
  } = params;

  const post = await repository.getPostWithUserAndFields(parseInt(id))

  if (!post) {
    return notFound()
  }

  const user = await auth()
  return (
    <>
      <div className="w-full max-w-4xl p-3 sm:p-5">
        <ActivityItem post={post} user={user}></ActivityItem>
      </div>
    </>
  )
}
