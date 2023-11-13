import { Field, Post } from '@prisma/client'
import type { FeatureCollection, LineString } from 'geojson'
import React from 'react'

import { FeedItem, FeedItemFeedPost } from './FeedItem'

// Post might be with extra includes like Field, take the actual type as input and re-write the JSON fields
export type FeedPost<IPost extends Post = Post> = Omit<
  IPost,
  'geoJson' | 'sprints' | 'runs'
> & {
  maxHeartRate: number
  averageHeartRate: number
  geoJson?: FeatureCollection<LineString>
  sprints?: Array<FeatureCollection<LineString>>
  runs?: Array<FeatureCollection<LineString>>
  User: {
    firstName?: string
    lastName?: string
    picture?: string
  }
  Field?: Field
}

export interface Props {
  feed: FeedItemFeedPost[]
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
