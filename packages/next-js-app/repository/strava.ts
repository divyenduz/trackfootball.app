import {
  getActivityById,
  getActivityStreams,
  getLoggedInAthleteActivities,
} from '@trackfootball/open-api'
import { GeoData } from '@trackfootball/sprint-detection/geoData'
import { getStravaToken } from 'services/strava/token'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'

async function getStravaAccessTokenHeaders(userId: number) {
  const stravaAccessToken = await getStravaToken(userId)
  return {
    Authorization: `Bearer ${stravaAccessToken}`,
  }
}

export async function checkStravaAccessToken(userId: number) {
  const stravaAccessTokenHeaders = await getStravaAccessTokenHeaders(userId)
  try {
    await getLoggedInAthleteActivities(
      {
        per_page: 1,
      },
      {
        headers: stravaAccessTokenHeaders,
      }
    )
    return true
  } catch (e) {
    console.error('Error: strava check failed')
    console.error(e)
    return false
  }
}

export async function fetchStravaActivity(activityId: number, userId: number) {
  const stravaAccessTokenHeaders = await getStravaAccessTokenHeaders(userId)
  const activity = await getActivityById(
    activityId,
    {
      include_all_efforts: false,
    },
    {
      headers: stravaAccessTokenHeaders,
    }
  )
  return activity
}

export async function fetchStravaActivityGeoJson(
  activityId: number,
  userId: number
) {
  const stravaAccessTokenHeaders = await getStravaAccessTokenHeaders(userId)
  const activityStreams = getActivityStreams(
    activityId,
    {
      keys: ['latlng', 'time', 'heartrate'],
      key_by_type: true,
    },
    {
      headers: stravaAccessTokenHeaders,
    }
  )

  const activity = await fetchStravaActivity(activityId, userId)
  const activityName = activity.name
  invariant(activityName, 'invariant: activity must have a name')
  const activityStartDate = activity.start_date
  invariant(activityStartDate, 'invariant: activity must have a start date')
  const geoJson = match(Boolean(activityStreams))
    .with(true, () =>
      new GeoData(
        activityName,
        JSON.stringify(activityStreams),
        'StravaActivityStream',
        new Date(activityStartDate)
      ).toGeoJson()
    )
    .otherwise(() => null)

  return geoJson
}
