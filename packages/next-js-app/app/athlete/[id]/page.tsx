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

import { ConnectWithStravaWidget } from '../../../components/organisms/Settings/ConnectWithStravaWidget'
import ShowToOwner from '../../../components/user/role-based-access/ShowToOwner'
import { repository } from '@trackfootball/database'

export type CheckStravaState =
  | 'LOADING'
  | 'NOT_CONNECTED'
  | 'WORKING'
  | 'NOT_WORKING'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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
  params: {
    id: string
  }
}

export default async function Profile({ params }: Props) {
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

  // Fetch athlete stats from database
  const { totalActivities, totalDistance, totalSprints, maxSpeed } =
    await repository.getAthleteStats(athlete.id)

  // Fetch athlete activities (up to 5 most recent for display)
  const athletePosts = await repository.getAthleteActivities(athlete.id, 5)

  return (
    <div className="w-full max-w-4xl">
      <Card className="mb-6 overflow-hidden shadow-lg">
        <CardHeader
          className="flex flex-wrap gap-4 p-6 bg-gradient-to-r from-red-600 to-red-800 text-white"
          title={
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                <Image
                  alt="User's display picture"
                  width={100}
                  height={100}
                  src={
                    athlete.picture ||
                    'https://trackfootball-public.s3.ap-southeast-1.amazonaws.com/prod/user.svg'
                  }
                  className="object-cover"
                />
              </Avatar>
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

        <ShowToOwner ownerId={athlete.id} userId={currentUser.id}>
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
                  Max Speed
                </Typography>
              </div>
              <Typography className="text-2xl font-bold text-gray-800">
                {maxSpeed && !isNaN(maxSpeed) ? maxSpeed.toFixed(1) : '0.0'}{' '}
                km/h
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
              <div className="space-y-4">
                {athletePosts.slice(0, 5).map((post) => (
                  <Card
                    key={post.id}
                    className="bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 hover:border-blue-300 overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <Typography className="font-medium text-blue-700">
                            {post.text}
                          </Typography>
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-400 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <Typography className="text-gray-500 text-sm">
                              {post.startTime
                                ? new Date(post.startTime).toLocaleDateString()
                                : 'No date'}
                            </Typography>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 bg-gray-100 p-3 border-t border-gray-200 text-sm">
                        <div className="flex flex-col items-center">
                          <span className="text-gray-500 mb-1">Distance</span>
                          <span className="font-medium">
                            {(post.totalDistance / 1000).toFixed(2)} km
                          </span>
                        </div>
                        <div className="flex flex-col items-center border-l border-r border-gray-200">
                          <span className="text-gray-500 mb-1">Duration</span>
                          <span className="font-medium">
                            {Math.floor(post.elapsedTime / 60)} min
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-gray-500 mb-1">Max Speed</span>
                          <span className="font-medium">
                            {post.maxSpeed.toFixed(1)} km/h
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {athletePosts.length > 5 && (
                  <div className="flex justify-center mt-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
                      View all activities
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-red-500 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <Typography className="text-lg font-medium text-gray-800 mb-2">
                  No Activities Yet
                </Typography>
                <Typography className="text-gray-500 max-w-sm mx-auto">
                  This athlete hasn&apos;t recorded any activities yet.
                  Activities will appear here once they connect with Strava and
                  record their games.
                </Typography>
                {athlete.id === currentUser.id && (
                  <button className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors inline-flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Connect Account
                  </button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
