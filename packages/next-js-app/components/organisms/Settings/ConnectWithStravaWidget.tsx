'use client'

import { Button, Card, CardContent, CardHeader } from '@mui/material'
import { disconnectStrava } from 'app/actions/disconnectStrava'
import { CheckStravaState } from 'app/athlete/[id]/page'
import { match } from 'ts-pattern'

import { Space } from '../../../components/atoms/Space'
import ConnectWithStrava from '../../../components/atoms/brand/strava/ConnectWithStrava'

interface Props {
  redirectTo: 'dashboard' | 'athlete'
  backendApiUrl: string
  checkStravaState: CheckStravaState
}

export const ConnectWithStravaWidget: React.FC<Props> = ({
  redirectTo,
  backendApiUrl,
  checkStravaState,
}) => {
  return (
    <Card>
      <Space direction="vertical">
        <CardHeader title="Strava"></CardHeader>
        <CardContent>
          {match(checkStravaState)
            .with('WORKING', () => (
              <Button
                variant="contained"
                color="secondary"
                onClick={async () => {
                  await disconnectStrava()
                }}
              >
                Disconnect Strava
              </Button>
            ))
            .otherwise(() => (
              <ConnectWithStrava
                callbackUrl={`${backendApiUrl}/social/strava/callback/?redirect_to=${redirectTo}`}
              ></ConnectWithStrava>
            ))}
        </CardContent>
      </Space>
    </Card>
  )
}
