import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Typography,
} from '@mui/material'
import { formatDistance } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { match } from 'ts-pattern'

import { getBoundsForPoints } from '../../../packages/utils/map'
import { GetPostRouterResponse } from '../../../pages/api/trpc/queries/getPost'
import { MapInstance } from '../MapInstance'
import { FeedPost } from './Feed'

export type FeedItemFeedPost = FeedPost<GetPostRouterResponse>

export interface Props {
  post: FeedItemFeedPost
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

      //@ts-expect-error
      const bounds = await getBoundsForPoints(post)

      const newViewport = {
        width: '100%',
        height: 350,
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
            <Link
              legacyBehavior
              href="/athlete/[id]"
              as={`/athlete/${post.userId}`}
              passHref={true}
            >
              <a>
                <Avatar className="w-10 h-10">
                  <Image
                    alt="User's display picture"
                    width={40}
                    height={40}
                    src={
                      post.User?.picture ||
                      'https://trackfootball-public.s3.ap-southeast-1.amazonaws.com/prod/user.svg'
                    }
                  ></Image>
                </Avatar>
              </a>
            </Link>
          }
          title={
            <>
              <Link
                legacyBehavior
                href="/athlete/[id]"
                as={`/athlete/${post.userId}`}
                passHref={true}
              >
                <a>
                  <Typography
                    component="strong"
                    className="font-medium text-left text-gray-900 cursor-pointer"
                  >
                    {post.User?.firstName || ''} {post.User?.lastName || ''}
                  </Typography>
                </a>
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
                  }
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
              <Link
                legacyBehavior
                href="/activity/[id]"
                as={`/activity/${post.id}`}
                passHref={true}
              >
                <a>
                  <Typography
                    component="h2"
                    className="text-base font-medium text-left cursor-pointer"
                  >
                    {post.text}
                  </Typography>
                </a>
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
          <Link
            legacyBehavior
            href="/athlete/[id]"
            as={`/athlete/${post.userId}`}
            passHref={true}
          >
            <a>
              <Avatar className="w-10 h-10">
                <Image
                  alt="User's display picture"
                  width={40}
                  height={40}
                  className="object-cover"
                  src={
                    post.User?.picture ||
                    'https://trackfootball-public.s3.ap-southeast-1.amazonaws.com/prod/user.svg'
                  }
                ></Image>
              </Avatar>
            </a>
          </Link>
        }
        title={
          <>
            <Link
              legacyBehavior
              href="/athlete/[id]"
              as={`/athlete/${post.userId}`}
              passHref={true}
            >
              <a>
                <div className="text-base font-bold text-left text-gray-900 cursor-pointer">
                  {post.User?.firstName || ''} {post.User?.lastName || ''}
                </div>
              </a>
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
                }
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
            <Link
              legacyBehavior
              href="/activity/[id]"
              as={`/activity/${post.id}`}
              passHref={true}
            >
              <a className="text-gray-900">
                <div className="text-2xl font-semibold text-left cursor-pointer">
                  {post.text}
                </div>
              </a>
            </Link>
          }
        ></CardHeader>
        <CardContent>
          <Link
            legacyBehavior
            href="/activity/[id]"
            as={`/activity/${post.id}`}
            passHref={true}
          >
            <a>
              <MapInstance
                isMapMovable={false}
                viewport={viewport}
                setViewport={setViewport}
                topSprintOnly={false}
                showSprints={false}
                showRuns={false}
                showHeatmap={true}
                post={post}
                page={'feed'}
              />
            </a>
          </Link>
        </CardContent>
      </Paper>
    </Card>
  )
}
