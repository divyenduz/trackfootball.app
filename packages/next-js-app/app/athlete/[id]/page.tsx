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
import { notFound } from 'next/navigation'
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

interface Props {
  params: {
    id: string
  }
}

export default async function Profile({ params }: Props) {
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
  const checkStravaState = (await checkStravaToken(user)) as CheckStravaState

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

          <ShowToOwner
            ownerId={user.id}
            userId={user.id}
            userIsAdmin={user.type === 'ADMIN'}
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
