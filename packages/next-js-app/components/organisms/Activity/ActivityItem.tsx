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
import { formatDistance } from 'date-fns'
import { useFlags } from 'launchdarkly-react-client-sdk'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { match } from 'ts-pattern'

import Button from '../../../components/atoms/Button'
import { getBoundsForPoints } from '../../../packages/utils/map'
import { GetPostRouterResponse } from '../../../pages/api/trpc/queries/getPost'
import { ConditionalDisplay } from '../../atoms/ConditionalDisplay'
import ShowToOwner from '../../user/role-based-access/ShowToOwner'
import { FeedPost } from '../Feed/Feed'
import { FeedItemAction } from '../Feed/FeedItemAction'
import { MapInstance } from '../MapInstance'

export type FeedItemFeedPost = FeedPost<GetPostRouterResponse>

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

export interface Props {
  post: FeedItemFeedPost
  onRefresh?: () => void
  onDelete?: (post: FeedItemFeedPost) => void
}

const ActivityItem: React.FC<Props> = ({
  post,
  onRefresh = () => {},
  onDelete = () => {},
}) => {
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
        <CardHeader
          className="p-2"
          avatar={
            <Link
              legacyBehavior
              href="`/athlete/[id]`"
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
          id={`activity-item-${post.id}`}
          className="w-full mb-5"
        >
          <CardHeader
            className="flex flex-wrap gap-4 p-1"
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
            action={
              <div className="md:w-full">
                <ActivityItemAdminActions
                  onRefresh={onRefresh}
                ></ActivityItemAdminActions>
                <ShowToOwner ownerId={post.userId}>
                  <FeedItemAction onDelete={onDelete} />
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
        id={`activity-item-${post.id}`}
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
          action={
            <div className="flex space-x-2 md:w-full">
              <ActivityItemAdminActions
                onRefresh={onRefresh}
              ></ActivityItemAdminActions>
              <ShowToOwner ownerId={post.userId}>
                <FeedItemAction onDelete={onDelete} />
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

            <ShowToOwner className={classes.paper} ownerId={post.userId}>
              <div className={classes.title}>❤️ Max Heart Rate</div>
              <div className={classes.value}>{post.maxHeartRate}</div>
            </ShowToOwner>

            <ShowToOwner className={classes.paper} ownerId={post.userId}>
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
                legacyBehavior
                href={`https://strava.com/activities/${post.key}`}
                passHref
              >
                <a target="_blank">View on Strava</a>
              </Link>
            </div>
          </ConditionalDisplay>
        </CardContent>
      </Paper>
    </Card>
  )
}

const ActivityItemAdminActions: React.FC<Pick<Props, 'onRefresh'>> = ({
  onRefresh = () => {},
}) => {
  const flags = useFlags()

  if (!flags.showToAdmin) {
    return null
  }

  return (
    <span style={{ border: 'dashed 1px red' }}>
      <Button
        variant="outlined"
        onClick={() => {
          const r = confirm(
            'Are you sure that you want to refresh the statistics of this post?'
          )
          if (r) {
            onRefresh()
          }
        }}
      >
        🔄
      </Button>
    </span>
  )
}

export default ActivityItem
