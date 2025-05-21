'use client'

import { FeedItemType } from 'app/actions/getFeed'
import ActivityItem from 'components/organisms/Activity/ActivityItem'
import { useAuth } from 'hooks/auth/useAuth'
import React from 'react'

export interface Props {
  post: FeedItemType
}

export const FeedItem: React.FC<Props> = ({ post }) => {
  const { user } = useAuth()
  
  // Convert FeedItemType to AwaitedPost for ActivityItem
  const formattedPost = {
    ...post,
    User: post.User,
    Field: post.Field,
    // Add necessary properties to satisfy AwaitedPost type
    numberOfCoordinates: 0,
    maxHeartRate: 0,
    averageHeartRate: 0,
    numberOfSprints: post.sprintCount || 0,
    numberOfRuns: 0,
    geoJson: null, // We're using mapImageUrl instead
  }
  
  return (
    <ActivityItem post={formattedPost} user={user} page="feed" />
  )
}
