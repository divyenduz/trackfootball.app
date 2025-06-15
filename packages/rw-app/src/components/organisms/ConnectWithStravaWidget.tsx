'use client'

import { Button } from '@mui/material'
// import { disconnectStrava } from 'app/actions/disconnectStrava'
import { match } from 'ts-pattern'
import ConnectWithStrava from '@/components/atoms/strava/ConnectWithStrava'

export type CheckStravaState =
  | 'LOADING'
  | 'NOT_CONNECTED'
  | 'WORKING'
  | 'NOT_WORKING'

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
  return match(checkStravaState)
    .with('WORKING', () => (
      <Button
        variant="contained"
        color="secondary"
        size="small"
        onClick={async () => {
          alert('Disconnecting Strava is not implemented yet.') // await disconnectStrava()
        }}
      >
        Disconnect Strava
      </Button>
    ))
    .otherwise(() => (
      <ConnectWithStrava
        callbackUrl={`${backendApiUrl}/social/strava/callback/?redirect_to=${redirectTo}`}
      ></ConnectWithStrava>
    ))
}
