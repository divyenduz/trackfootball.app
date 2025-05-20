'use client'

import { TabContext, TabList, TabPanel } from '@mui/lab'
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Tab,
  Typography,
  useTheme,
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Core } from '@trackfootball/sprint-detection'
import { metersToKilometers, mpsToKmph } from '@trackfootball/utils'
import { refreshPost } from 'app/actions/refreshPost'
import { deletePost } from 'app/actions/deletePost'
import { AwaitedUser } from 'app/layout'
import Button from 'components/atoms/Button'
import { formatDistance } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import { getBoundsForPoints } from 'packages/utils/map'
import React, { useEffect, useState } from 'react'
import { getPost } from 'repository/post'
import { match } from 'ts-pattern'

import { ConditionalDisplay } from '../../atoms/ConditionalDisplay'
import ShowToOwner from '../../user/role-based-access/ShowToOwner'
import { FeedItemAction } from '../Feed/FeedItemAction'
import { MapInstance } from '../MapInstance'

const prettyRunMetricDistance = (hasSprints: boolean, distance: number) => {
  if (!hasSprints) {
    return '-'
  }
  return distance
}
const prettyRunMetricSpeed = (hasSprints: boolean, speed: number) => {
  if (!hasSprints) {
    return '-'
  }
  return mpsToKmph(speed)
}

export type AwaitedPost = NonNullable<Awaited<ReturnType<typeof getPost>>>

export interface Props {
  post: AwaitedPost
  user: AwaitedUser | null
}

interface AdminControlsProps {
  post: AwaitedPost
  userIsAdmin?: boolean
}

const AdminControls: React.FC<AdminControlsProps> = ({ post, userIsAdmin }) => {
  if (!userIsAdmin) return null;
  
  return (
    <div className="flex justify-between items-center p-2 mb-3 bg-gray-50 border border-gray-200 rounded-md">
      <div className="text-sm font-medium text-gray-700">Admin Controls</div>
      <div className="flex space-x-2">
        <button 
          className="px-3 py-1.5 text-xs rounded-md bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 transition-colors"
          onClick={async () => {
            const r = confirm('Are you sure that you want to refresh the statistics of this post?')
            if (r) {
              await refreshPost(post.id)
            }
          }}
        >
          🔄 Refresh
        </button>
        <button 
          className="px-3 py-1.5 text-xs rounded-md bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-colors"
          onClick={async () => {
            const rc = confirm('Are you sure that you want to delete this activity? This cannot be undone.')
            if (!rc) return;
            try {
              await deletePost(post.id)
              window.location.href = '/dashboard'
            } catch (e) {
              console.error(e)
              alert(`Something went wrong, please contact singh@trackfootball.app` + e)
            }
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<Props> = ({ post, user }) => {
  const [tab, setTab] = useState('distance')

  const classes = {
    paper:
      'flex flex-col gap-2 items-center justify-initial grow md:grow-0 min-w-[30%] w-full lg:w-fit md: border-solid border border-gray-300 rounded-md p-5',
    title:
      'font-semibold text-xs w-full flex flex-row items-center gap-1 text-gray-600',
    value:
      'font-bold text-2xl w-full flex flex-wrap flex-row justify-center items-baseline gap-1',
  }

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
        height: 350,
        ...bounds,
      }
      setViewport(newViewport)
    }
    effect()
  }, [post])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const hasSprints = Boolean(post.sprints) && post.sprints!.length > 0
  // const hasRuns = Boolean(post.runs) && post.runs!.length > 0

  if (!Boolean(post.geoJson)) {
    return (
      <Card
        raised={false}
        key={post.id}
        id={`activity-item-${post.id}`}
        className={'w-full mb-5'}
      >
        {user?.type === 'ADMIN' && <AdminControls post={post} userIsAdmin={user?.type === 'ADMIN'} />}
        <CardHeader
          className="p-2"
          avatar={
            <Link href={`/athlete/${post.userId}`}>
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
            </Link>
          }
          title={
            <>
              <Link href={`/athlete/${post.userId}`}>
                <Typography
                  component="strong"
                  className="font-medium text-left text-gray-900 cursor-pointer"
                >
                  {post.User?.firstName || ''} {post.User?.lastName || ''}
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
                  }
                )}
              </Typography>
            </>
          }
        ></CardHeader>
        <Paper
          elevation={0}
          key={post.id}
          id={`activity-item-${post.id}`}
          className="w-full mb-5"
        >
          <CardHeader
            className="flex flex-wrap gap-4 p-1"
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
            action={
              <div className="md:w-full">
                <ShowToOwner
                  ownerId={post.userId}
                  userId={user?.id || -1}
                  userIsAdmin={user?.type === 'ADMIN'}
                >
                  <FeedItemAction postId={post.id} />
                </ShowToOwner>
              </div>
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

  const core = new Core(post.geoJson as any)

  const isMapMovable = match(isMobile)
    .with(false, () => true)
    .otherwise(() => false)

  const power = (post.sprints?.length || 0) + (post.runs?.length || 0)

  return (
    <Card
      raised={false}
      key={post.id}
      id={`activity-item-${post.id}`}
      className="w-full mb-5"
    >
      {user?.type === 'ADMIN' && <AdminControls post={post} userIsAdmin={user?.type === 'ADMIN'} />}
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
        id={`activity-item-${post.id}`}
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
          action={
            <div className="flex space-x-2 md:w-full">
              <ShowToOwner
                ownerId={post.userId}
                userId={user?.id || -1}
                userIsAdmin={user?.type === 'ADMIN'}
              >
                <FeedItemAction postId={post.id} />
              </ShowToOwner>
            </div>
          }
        ></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-5 my-5 ">
            <div className={classes.paper}>
              <div className={classes.title}>⏱️ Activity Time</div>
              <div className={classes.value}>
                {Math.floor(post.elapsedTime / 60) + ' min'}
              </div>
            </div>

            <ShowToOwner
              className={classes.paper}
              ownerId={post.userId}
              userId={user?.id || -1}
              userIsAdmin={user?.type === 'ADMIN'}
            >
              <div className={classes.title}>❤️ Max Heart Rate</div>
              <div className={classes.value}>{post.maxHeartRate}</div>
            </ShowToOwner>

            <ShowToOwner
              className={classes.paper}
              ownerId={post.userId}
              userId={user?.id || -1}
              userIsAdmin={user?.type === 'ADMIN'}
            >
              <div className={classes.title}>❤️ Average Heart Rate</div>
              <div className={classes.value}>{post.averageHeartRate}</div>
            </ShowToOwner>
          </div>

          <TabContext value={tab}>
            <TabList
              onChange={(_, newValue) => {
                setTab(newValue)
              }}
              variant="fullWidth"
              indicatorColor="secondary"
              textColor="secondary"
              aria-label="icon label tabs example"
            >
              <Tab value="distance" label="Distance" />
              <Tab value="top-speed" label="Top Speed" />
              <Tab value="power" label="Power" />
            </TabList>
            <TabPanel value="distance">
              <div className={classes.paper}>
                <div className={classes.title}>🏃‍♂️ Total Distance</div>
                <div className={classes.value}>
                  {metersToKilometers(post.totalDistance)}{' '}
                  <span className="text-sm font-medium">km</span>
                </div>
              </div>
              <MapInstance
                isMapMovable={isMapMovable}
                viewport={viewport}
                setViewport={setViewport}
                topSprintOnly={false}
                showSprints={false}
                showRuns={false}
                showHeatmap={true}
                post={post}
                page={'activity'}
              />
            </TabPanel>
            <TabPanel value="top-speed" className="w-full">
              {match((post.sprints?.length || 0) > 0)
                .with(true, () => (
                  <div className={classes.paper}>
                    <div className={classes.title}>🔥 Fastest Sprint</div>
                    <div className={classes.value}>
                      <div>
                        {prettyRunMetricDistance(
                          hasSprints,
                          core.fastestSprintDistance()
                        )}{' '}
                        <span className="text-sm font-medium">m,</span>
                      </div>
                      <div>
                        {prettyRunMetricSpeed(
                          hasSprints,
                          core.fastestSprintSpeed()
                        )}{' '}
                        <span className="text-sm font-medium">Km/h</span>
                      </div>
                    </div>
                  </div>
                ))
                .with(false, () => (
                  <div className={classes.paper}>
                    <div className={classes.title}>💨 Top Speed</div>
                    <div className={classes.value}>
                      {+mpsToKmph(core.maxSpeed() || 0)}
                      <span className="text-sm font-medium">km/h</span>
                    </div>
                  </div>
                ))
                .exhaustive()}

              <MapInstance
                isMapMovable={isMapMovable}
                viewport={viewport}
                setViewport={setViewport}
                topSprintOnly={true}
                showSprints={true}
                showRuns={true}
                showHeatmap={false}
                post={post}
                page={'activity'}
              />
            </TabPanel>
            <TabPanel value="power" className="w-full space-y-2">
              <div className={classes.paper}>
                <div className={classes.title}>🔋 Sprints + Runs</div>
                <div className={classes.value}>{power}</div>
              </div>

              <ConditionalDisplay visible={power > 0}>
                <div className={classes.paper}>
                  <div className={classes.title}>💪 Longest Sprint</div>
                  <div className={classes.value}>
                    <div>
                      {prettyRunMetricDistance(
                        hasSprints,
                        core.longestSprintDistance()
                      )}{' '}
                      <span className="text-sm font-medium">m,</span>{' '}
                    </div>
                    <div>
                      {prettyRunMetricSpeed(
                        hasSprints,
                        core.longestSprintSpeed()
                      )}{' '}
                      <span className="text-sm font-medium">Km/h</span>
                    </div>
                  </div>
                </div>
              </ConditionalDisplay>

              <MapInstance
                isMapMovable={isMapMovable}
                viewport={viewport}
                setViewport={setViewport}
                topSprintOnly={false}
                showSprints={true}
                showRuns={true}
                showHeatmap={false}
                post={post}
                page={'activity'}
              />
            </TabPanel>
          </TabContext>

          <ConditionalDisplay visible={post.type === 'STRAVA_ACTIVITY'}>
            <div className="flex items-center justify-center">
              <Link
                href={`https://strava.com/activities/${post.key}`}
                target="_blank"
              >
                View on Strava
              </Link>
            </div>
          </ConditionalDisplay>
        </CardContent>
      </Paper>
    </Card>
  )
}

export default ActivityItem