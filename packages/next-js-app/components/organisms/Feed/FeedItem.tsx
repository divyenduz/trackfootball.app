'use client'

import { Card, CardContent, CardHeader, Paper } from '@mui/material'
import { FeedItemType } from 'app/actions/getFeed'
import { formatDistance } from 'date-fns'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { match } from 'ts-pattern'

import { getBoundsForPoints } from '../../../packages/utils/map'
import { MapInstance } from '../MapInstance'
import { Photo } from 'components/atoms/Photo'

export interface Props {
  post: FeedItemType
}

export const FeedItem: React.FC<Props> = ({ post }) => {
  const fallbackCoords = {
    latitude: 52.520008,
    longitude: 13.404954,
    zoom: 15,
  }
  const [viewport, setViewport] = useState(fallbackCoords)

  useEffect(() => {
    async function effect() {
      if (!post) {
        return
      }

      const bounds = await getBoundsForPoints(post)

      const newViewport = {
        width: '100%',
        height: 400,
        ...bounds,
      }
      setViewport(newViewport)
    }
    effect()
  }, [post])

  if (!Boolean(post.geoJson)) {
    console.log(`Note: post ${post.id} without geoJson found on feed`)
    return null
  }

  return (
    <Card
      raised={false}
      key={post.id}
      id={`feed-item-${post.id}`}
      className="w-full mb-3 sm:mb-5"
    >
      <CardHeader
        className="p-1 sm:p-2"
        avatar={
          <Link href={`/athlete/${post.userId}`}>
            <Photo photo={post.User.picture}></Photo>
          </Link>
        }
        title={
          <>
            <Link href={`/athlete/${post.userId}`}>
              <div className="text-base font-bold text-left text-gray-900 cursor-pointer">
                {post.User.firstName} {post.User.lastName}
              </div>
            </Link>
            <div className="text-xs font-normal text-gray-500">
              {formatDistance(
                match(post.startTime)
                  .with(null, () => new Date())
                  .otherwise((startTime) => new Date(startTime)),
                new Date(),
                {
                  addSuffix: true,
                },
              )}
            </div>
          </>
        }
      ></CardHeader>
      <Paper
        elevation={0}
        key={post.id}
        id={`feed-item-${post.id}`}
        className="w-full"
      >
        <CardHeader
          className="flex flex-wrap p-1 sm:p-2"
          title={
            <Link href={`/activity/${post.id}`}>
              <div className="text-2xl font-semibold text-left text-gray-900 cursor-pointer">
                {post.text}
              </div>
            </Link>
          }
        ></CardHeader>
        <CardContent className="p-2 sm:p-4">
          <Link href={`/activity/${post.id}`}>
            <MapInstance
              isMapMovable={false}
              // @ts-expect-error unify viewport properties
              viewport={viewport}
              // @ts-expect-error unify viewport properties
              setViewport={setViewport}
              showSprints={false}
              showRuns={false}
              showHeatmap={true}
              post={post}
              page={'feed'}
            />
          </Link>
        </CardContent>
      </Paper>
    </Card>
  )
}
