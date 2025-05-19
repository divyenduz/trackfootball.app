import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material'
import { checkStravaToken } from 'app/actions/checkStravaToken'
import { Metadata } from 'next'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { auth } from 'utils/auth'

import { Space } from '../../../components/atoms/Space'
import { ConnectWithStravaWidget } from '../../../components/organisms/Settings/ConnectWithStravaWidget'
import ShowToOwner from '../../../components/user/role-based-access/ShowToOwner'
import {
  getUser,
  getUserStravaSocialLogin,
} from '../../../repository/user/user'

export type CheckStravaState =
  | 'LOADING'
  | 'NOT_CONNECTED'
  | 'WORKING'
  | 'NOT_WORKING'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const userId = parseInt(params.id, 10)
  const user = await getUser(userId)

  if (!user) {
    return {
      title: 'Athlete Not Found | TrackFootball',
    }
  }

  return {
    title: `${user.firstName} ${user.lastName} | Profile | TrackFootball`,
  }
}

export async function getBackendApiUrl() {
  const backendApiUrl =
    process.env.BACKEND_API || 'https://trackfootball.app/api'
  return backendApiUrl
}

interface Props {
  params: {
    id: string
  }
}

export default async function Profile({ params }: Props) {
  const userId = parseInt(params.id, 10)
  if (isNaN(userId)) {
    return notFound()
  }

  const athlete = await getUser(userId)
  if (!athlete) {
    return notFound()
  }

  const socialLogin = await getUserStravaSocialLogin(athlete.id)
  if (!socialLogin) {
    return notFound()
  }
  const athleteWithSocialLogin = {
    ...athlete,
    socialLogin: [socialLogin],
  }

  let currentUser = null
  try {
    currentUser = await auth()
  } catch (e) {
    console.error(e)
  }

  if (!currentUser) {
    redirect('/api/auth/login')
  }

  const backendApiUrl = await getBackendApiUrl()
  const checkStravaState = (await checkStravaToken(
    //@ts-expect-error match the social login types
    athleteWithSocialLogin
  )) as CheckStravaState

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
                    athlete.picture ||
                    'https://trackfootball-public.s3.ap-southeast-1.amazonaws.com/prod/user.svg'
                  }
                ></Image>
              </Avatar>
              <Typography
                component="h2"
                className="text-base font-medium text-left cursor-pointer"
              >
                {athlete.firstName ?? ''} {athlete.lastName ?? ''}
              </Typography>
            </div>
          }
        ></CardHeader>

        <CardContent>
          <div style={{ marginBottom: 30 }}></div>

          <ShowToOwner
            ownerId={athlete.id}
            userId={currentUser.id}
            userIsAdmin={Boolean(currentUser?.type === 'ADMIN')}
          >
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
