import { getFeed } from 'app/dashboard/page'
import React from 'react'
import { getPost } from 'repository/post'

import { FeedItem } from './FeedItem'

export type FeedPost = Awaited<ReturnType<typeof getFeed>>['posts'][0]
export type FullPost = NonNullable<Awaited<ReturnType<typeof getPost>>>

export type AwaitedPost = FeedPost | FullPost

interface Props {
  feed: Array<AwaitedPost>
}

export const Feed: React.FC<Props> = ({ feed }) => {
  return (
    <>
      {feed.map((post) => {
        return <FeedItem key={post.id} post={post}></FeedItem>
      })}
    </>
  )
}
