import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import React from 'react'

import { Space } from '../../../components/atoms/Space'
import { ConnectWithStravaWidget } from '../../../components/organisms/Settings/ConnectWithStravaWidget'
import ShowToOwner from '../../../components/user/role-based-access/ShowToOwner'
import { Layout } from '../../../layouts/Layout'
import { trpc } from '../../../packages/utils/trpcReact'
import { ensureUser } from '../../../packages/utils/utils'

export default function Profile() {
  const meQuery = trpc.useQuery(['app.me'])

  if (meQuery.isLoading) {
    return <Layout pageTitle={`Profile | TrackFootball`}>Loading...</Layout>
  }

  if (meQuery.error) {
    console.error({ error: meQuery.error })
    return (
      <Layout pageTitle={`Profile | TrackFootball`}>
        Failed to load the user.
      </Layout>
    )
  }

  const user = meQuery.data?.user

  if (!ensureUser(user)) {
    return (
      <Layout pageTitle={`Not Found | TrackFootball`}>
        404 - User Not found
      </Layout>
    )
  }

  return (
    <Layout
      pageTitle={`${user.firstName} ${user.lastName} | Profile | TrackFootball`}
    >
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

          <ShowToOwner ownerId={user.id}>
            <Card>
              <Space direction="vertical">
                <CardHeader title="Integrations"></CardHeader>
                <CardContent>
                  <Space direction="horizontal">
                    <ConnectWithStravaWidget redirectTo="athlete"></ConnectWithStravaWidget>
                  </Space>
                </CardContent>
              </Space>
            </Card>
          </ShowToOwner>
        </CardContent>
      </Card>
    </Layout>
  )
}
