import { Card, CardContent, CardHeader, Typography } from '@mui/material'
import { checkStravaToken } from 'app/actions/checkStravaToken'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from 'utils/auth'

import { ConnectWithStravaWidget } from '../../../components/organisms/Settings/ConnectWithStravaWidget'
import ShowToOwner from '../../../components/user/role-based-access/ShowToOwner'
import { repository } from '@trackfootball/database'
import { Photo } from 'components/atoms/Photo'
import Feed from '../../dashboard/Feed'

export type CheckStravaState =
  | 'LOADING'
  | 'NOT_CONNECTED'
  | 'WORKING'
  | 'NOT_WORKING'

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const userId = parseInt(params.id, 10)
  const user = await repository.getUser(userId)

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
  params: Promise<{
    id: string
  }>
}

export default async function Profile(props: Props) {
  const params = await props.params
  const userId = parseInt(params.id, 10)
  if (isNaN(userId)) {
    return notFound()
  }

  const athlete = await repository.getUser(userId)
  if (!athlete) {
    return notFound()
  }

  const socialLogin = await repository.getUserStravaSocialLogin(athlete.id)
  const athleteWithSocialLogin = {
    ...athlete,
    socialLogin: socialLogin ? [socialLogin] : [],
  }

  const currentUser = await auth()

  const backendApiUrl = await getBackendApiUrl()
  const checkStravaState = (await checkStravaToken(
    athleteWithSocialLogin,
  )) as CheckStravaState

  const { totalActivities, totalDistance, totalSprints, totalRuns } =
    await repository.getAthleteStats(athlete.id)

  const athleteFeed = await repository.getAthleteFeed(athlete.id, 0, 3)

  return (
    <div className="w-full max-w-4xl">
      <Card className="mb-6 overflow-hidden shadow-lg">
        <CardHeader
          className="flex flex-wrap gap-4 p-6 bg-gradient-to-r from-red-600 to-red-800 text-white"
          title={
            <div className="flex items-center space-x-4">
              <Photo photo={athlete.picture}></Photo>
              <div>
                <Typography
                  component="h2"
                  className="text-2xl font-bold text-white"
                >
                  {athlete.firstName ?? ''} {athlete.lastName ?? ''}
                </Typography>
                <Typography className="text-blue-100 mt-1">
                  Member since{' '}
                  {new Date(athlete.createdAt).toLocaleDateString()}
                </Typography>
                {socialLogin && (
                  <div className="flex items-center mt-2">
                    <span className="mr-2">✅</span>
                    <Typography className="text-blue-100 text-sm">
                      Connected account
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          }
        />

        <ShowToOwner ownerId={athlete.id} userId={currentUser?.id}>
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex justify-end">
            <ConnectWithStravaWidget
              redirectTo="athlete"
              backendApiUrl={backendApiUrl}
              checkStravaState={checkStravaState}
            />
          </div>
        </ShowToOwner>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 transition-transform hover:scale-105 hover:border-red-300">
              <div className="flex items-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-red-600 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <Typography className="text-red-600 text-sm font-medium">
                  Activities
                </Typography>
              </div>
              <Typography className="text-2xl font-bold text-gray-800">
                {totalActivities}
              </Typography>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 transition-transform hover:scale-105 hover:border-red-300">
              <div className="flex items-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-red-600 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <Typography className="text-red-600 text-sm font-medium">
                  Total Distance
                </Typography>
              </div>
              <Typography className="text-2xl font-bold text-gray-800">
                {(totalDistance / 1000).toFixed(1)} km
              </Typography>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 transition-transform hover:scale-105 hover:border-red-300">
              <div className="flex items-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-red-600 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <Typography className="text-red-600 text-sm font-medium">
                  Total Sprints
                </Typography>
              </div>
              <Typography className="text-2xl font-bold text-gray-800">
                {totalSprints}
              </Typography>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 transition-transform hover:scale-105 hover:border-red-300">
              <div className="flex items-center mb-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-red-600 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <Typography className="text-red-600 text-sm font-medium">
                  Total Runs
                </Typography>
              </div>
              <Typography className="text-2xl font-bold text-gray-800">
                {totalRuns}
              </Typography>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <Typography component="h3" className="text-lg font-medium">
                Recent Activities
              </Typography>
            </div>

            {totalActivities > 0 ? (
              <Feed
                athleteId={athlete.id}
                initialFeed={athleteFeed.posts}
                initialNextCursor={athleteFeed.nextCursor}
              />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
