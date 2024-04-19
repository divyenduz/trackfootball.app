import { Alert } from '@mui/material'
import { checkStravaToken } from 'app/actions/checkStravaToken'
import { getFeed } from 'app/actions/getFeed'
import { CheckStravaState } from 'app/athlete/[id]/page'
import ConnectWithStrava from 'components/atoms/brand/strava/ConnectWithStrava'
import { redirect } from 'next/navigation'
import { match } from 'ts-pattern'
import { auth } from 'utils/auth'

import Feed from './Feed'

export const metadata = {
  title: 'Dashboard | TrackFootball',
}

export async function getBackendApiUrl() {
  const backendApiUrl =
    process.env.BACKEND_API || 'https://trackfootball.app/api'
  return backendApiUrl
}

export default async function Home() {
  let user = null
  try {
    user = await auth()
  } catch (e) {}
  if (!user) {
    // Note: not logged in, redirect to home page!
    redirect('/')
  }

  const checkStravaState = (await checkStravaToken(user)) as CheckStravaState

  const feedQuery = await getFeed()
  const feed = feedQuery.posts
  const nextCursor = feedQuery.nextCursor

  const backendApiUrl = await getBackendApiUrl()

  return (
    <div className="w-full max-w-4xl">
      <>
        {match(checkStravaState)
          .with('NOT_WORKING', 'NOT_CONNECTED', () => (
            <>
              <Alert severity="error">
                <p>
                  TrackFootball&apos;s is not connected to Strava, please
                  connect it using this button. Strava Football/Run activities
                  will be synced automatically.
                </p>
                <ConnectWithStrava
                  callbackUrl={`${backendApiUrl}/social/strava/callback`}
                ></ConnectWithStrava>
                <p>Having trouble? Please contact singh@trackfootball.app</p>
              </Alert>
              <div style={{ margin: 30 }}></div>
            </>
          ))
          .otherwise(() => (
            <></>
          ))}
      </>

      {feed.length > 0 && (
        <div className="w-full px-3 sm:px-5">
          <Feed initialFeed={feed} initialNextCursor={nextCursor} />
        </div>
      )}
    </div>
  )
}
