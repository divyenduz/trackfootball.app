import { Button, Card, CardContent, CardHeader } from '@mui/material'
import { match } from 'ts-pattern'

import { Space } from '../../../components/atoms/Space'
import ConnectWithStrava from '../../../components/atoms/brand/strava/ConnectWithStrava'
import { useCheckStrava } from '../../../hooks/social/checkStrava'
import { trpc } from '../../../packages/utils/trpcReact'

interface Props {
  redirectTo: 'dashboard' | 'athlete'
}

export const ConnectWithStravaWidget: React.FC<Props> = ({ redirectTo }) => {
  const trpcContext = trpc.useContext()
  const stravaDisconnect = trpc.useMutation('integration.strava.disconnect')
  const { checkStravaState } = useCheckStrava()

  const backendApiUrlQuery = trpc.useQuery(['system.backendApiUrl'], {
    ssr: true,
  })

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
                  await stravaDisconnect.mutateAsync()
                  trpcContext.invalidateQueries(['user.social.checkStrava'])
                }}
              >
                Disconnect Strava
              </Button>
            ))
            .otherwise(() => (
              <ConnectWithStrava
                callbackUrl={`${backendApiUrlQuery.data?.backendApiUrl}/social/strava/callback/?redirect_to=${redirectTo}`}
              ></ConnectWithStrava>
            ))}
        </CardContent>
      </Space>
    </Card>
  )
}
