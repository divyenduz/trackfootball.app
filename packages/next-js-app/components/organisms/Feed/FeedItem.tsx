'use client'

import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Typography,
} from '@mui/material'
import { FeedItemType } from 'app/actions/getFeed'
import { formatDistance } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { match } from 'ts-pattern'

import { getBoundsForPoints } from '../../../packages/utils/map'
import { MapInstance } from '../MapInstance'

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
    return (
      <Card
        raised={false}
        key={post.id}
        id={`feed-item-${post.id}`}
        className={'mt-5 mb-5'}
      >
        <CardHeader
          className="p-2"
          avatar={
            <Link href={`/athlete/${post.userId}`}>
              <Avatar className="w-10 h-10">
                {post.User.picture ? (
                  <Image
                    alt="User's display picture"
                    width={40}
                    height={40}
                    src={post.User.picture}
                  ></Image>
                ) : null}
              </Avatar>
            </Link>
          }
          title={
            <>
              <Link href={`/athlete/${post.userId}`}>
                <Typography
                  component="strong"
                  className="font-medium text-left text-gray-900 cursor-pointer"
                >
                  {post.User.firstName} {post.User.lastName}
                </Typography>
              </Link>
              <Typography className="text-xs font-normal text-gray-500">
                {formatDistance(
                  match(Boolean(post.startTime))
                    .with(true, () => new Date(post.startTime!))
                    .with(false, () => new Date())
                    .exhaustive(),
                  new Date(),
                  {
                    addSuffix: true,
                  },
                )}
              </Typography>
            </>
          }
        ></CardHeader>
        <Paper
          elevation={0}
          key={post.id}
          id={`feed-item-${post.id}`}
          className="w-full mb-5"
        >
          <CardHeader
            className="flex flex-wrap p-1"
            title={
              <Link href={`/activity/${post.id}`}>
                <Typography
                  component="h2"
                  className="text-base font-medium text-left cursor-pointer"
                >
                  {post.text}
                </Typography>
              </Link>
            }
          ></CardHeader>
          <CardContent>
            <>
              Activity is processing, please refresh the page in a few
              seconds...
            </>
          </CardContent>
        </Paper>
      </Card>
    )
  }

  return (
    <Card
      raised={false}
      key={post.id}
      id={`feed-item-${post.id}`}
      className="w-full mb-5"
    >
      <CardHeader
        className="p-1"
        avatar={
          post.User.picture ? (
            <Link href={`/athlete/${post.userId}`}>
              <Avatar className="w-10 h-10">
                <Image
                  alt="User's display picture"
                  width={40}
                  height={40}
                  className="object-cover"
                  src={post.User.picture}
                ></Image>
              </Avatar>
            </Link>
          ) : null
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
                match(Boolean(post.startTime))
                  .with(true, () => new Date(post.startTime!))
                  .with(false, () => new Date())
                  .exhaustive(),
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
        className="w-full mb-5"
      >
        <CardHeader
          className="flex flex-wrap p-1"
          title={
            <Link href={`/activity/${post.id}`}>
              <div className="text-2xl font-semibold text-left text-gray-900 cursor-pointer">
                {post.text}
              </div>
            </Link>
          }
        ></CardHeader>
        <CardContent>
          <Link href={`/activity/${post.id}`}>
            <MapInstance
              isMapMovable={false}
              // @ts-expect-error unify viewport properties
              viewport={viewport}
              // @ts-expect-error unify viewport properties
              setViewport={setViewport}
              topSprintOnly={false}
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
