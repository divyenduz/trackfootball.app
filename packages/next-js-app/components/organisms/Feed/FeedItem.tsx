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
import React from 'react'
import { match } from 'ts-pattern'




export interface Props {
  post: FeedItemType
}

export const FeedItem: React.FC<Props> = ({ post }) => {




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
          <Link href={`/athlete/${post.userId}`}>
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
          </Link>
        }
        title={
          <>
            <Link href={`/athlete/${post.userId}`}>
              <div className="text-base font-bold text-left text-gray-900 cursor-pointer">
                {post.User?.firstName || ''} {post.User?.lastName || ''}
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
            <Link href={`/activity/${post.id}`}>
              <div className="text-2xl font-semibold text-left text-gray-900 cursor-pointer">
                {post.text}
              </div>
            </Link>
          }
        ></CardHeader>
        <CardContent>
          <Link href={`/activity/${post.id}`}>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">Distance</div>
                  <div className="text-xl font-bold">{post.distance ? `${(post.distance / 1000).toFixed(2)} km` : 'N/A'}</div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="text-xl font-bold">{post.duration ? `${Math.floor(post.duration / 60)}m ${Math.floor(post.duration % 60)}s` : 'N/A'}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">Avg Speed</div>
                  <div className="text-lg font-bold">{post.avgSpeed ? `${post.avgSpeed.toFixed(1)} km/h` : 'N/A'}</div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">Max Speed</div>
                  <div className="text-lg font-bold">{post.maxSpeed ? `${post.maxSpeed.toFixed(1)} km/h` : 'N/A'}</div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500">Sprints</div>
                  <div className="text-lg font-bold">{post.sprintCount || 0}</div>
                </div>
              </div>
            </div>
          </Link>
        </CardContent>
      </Paper>
    </Card>
  )
}
