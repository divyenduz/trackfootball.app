import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material'
import { AwaitedUser } from 'app/layout'
import { Metadata, ResolvingMetadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { checkStravaAccessToken } from 'repository/strava'
import { match } from 'ts-pattern'
import { auth } from 'utils/auth'

import { Space } from '../../../components/atoms/Space'
import { ConnectWithStravaWidget } from '../../../components/organisms/Settings/ConnectWithStravaWidget'
import ShowToOwner from '../../../components/user/role-based-access/ShowToOwner'

export type CheckStravaState =
  | 'LOADING'
  | 'NOT_CONNECTED'
  | 'WORKING'
  | 'NOT_WORKING'

export async function generateMetadata(): Promise<Metadata> {
  const user = await auth()

  return {
    title: `${user.firstName} ${user.lastName} | Profile | TrackFootball`,
  }
}

export function getBackendApiUrl() {
  const backendApiUrl =
    process.env.BACKEND_API || 'https://trackfootball.app/api'
  return backendApiUrl
}

export async function checkStrava(user: AwaitedUser) {
  // if (!ctx.user) {
  //   throw new Error(MESSAGE_UNAUTHORIZED)
  // }

  const socialLogin = user?.socialLogin?.find((sl) => sl.platform === 'STRAVA')

  // Note: if no social login, strava is not connected
  if (!Boolean(socialLogin)) {
    return 'NOT_CONNECTED'
  }

  try {
    return (await checkStravaToken(user)) as CheckStravaState
  } catch (e) {
    console.error('Error: strava check failed')
    console.error(e)
    return 'NOT_WORKING' as CheckStravaState
  }
}

async function checkStravaToken(user: AwaitedUser) {
  if (!user) {
    console.error(
      'Note: failed to get strava access token, user not found in context'
    )
    return 'NOT_WORKING'
  }
  const r = await checkStravaAccessToken(user.id)
  return match(r)
    .with(true, () => 'WORKING')
    .with(false, () => 'NOT_WORKING')
    .exhaustive()
}

export default async function Profile() {
  let user = null
  try {
    user = await auth()
  } catch (e) {
    console.error(e)
  }
  if (!user) {
    return notFound()
  }

  const backendApiUrl = getBackendApiUrl()
  const checkStravaState = await checkStrava(user)

  return (
    <div className="w-full max-w-4xl">
      <Card>
        <CardHeader
          className="flex flex-wrap gap-4 p-1"
          title={
            <div className="flex items-center space-x-2">
              <Avatar>
                <Image
                  alt="User's display picture"
                  width={100}
                  height={100}
                  src={
                    user.picture ||
                    'https://trackfootball-public.s3.ap-southeast-1.amazonaws.com/prod/user.svg'
                  }
                ></Image>
              </Avatar>
              <Typography
                component="h2"
                className="text-base font-medium text-left cursor-pointer"
              >
                {user.firstName ?? ''} {user.lastName ?? ''}
              </Typography>
            </div>
          }
        ></CardHeader>

        <CardContent>
          <div style={{ marginBottom: 30 }}></div>

          <ShowToOwner ownerId={user.id} userId={user.id}>
            <Card>
              <Space direction="vertical">
                <CardHeader title="Integrations"></CardHeader>
                <CardContent>
                  <Space direction="horizontal">
                    <ConnectWithStravaWidget
                      redirectTo="athlete"
                      backendApiUrl={backendApiUrl}
                      checkStravaState={checkStravaState}
                    ></ConnectWithStravaWidget>
                  </Space>
                </CardContent>
              </Space>
            </Card>
          </ShowToOwner>
        </CardContent>
      </Card>
    </div>
  )
}
