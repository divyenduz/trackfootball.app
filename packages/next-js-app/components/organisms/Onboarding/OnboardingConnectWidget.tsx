import { Space } from '../../../components/atoms/Space'
import { ConnectWithStravaWidget } from '../Settings/ConnectWithStravaWidget'
import { OnboardingWidget } from './OnboardingWidget'

interface Props {}

export const OnboardingConnectWidget: React.FC<Props> = () => {
  return (
    <OnboardingWidget
      title={
        'You can track your football games as a run using strava and then add them to TrackFootball.'
      }
    >
      <Space direction="horizontal">
        <ConnectWithStravaWidget redirectTo="dashboard"></ConnectWithStravaWidget>
      </Space>
    </OnboardingWidget>
  )
}
