import { StravaApi } from '@trackfootball/open-api'
import { GeoData } from '@trackfootball/sprint-detection/geoData'
import { getStravaToken } from 'services/strava/token'
import { match } from 'ts-pattern'

import { DetailedActivity } from './strava/DetailedActivity'

async function getStravaApi(userId: number) {
  const stravaAccessToken = await getStravaToken(userId)
  const stravaApi = new StravaApi({
    baseApiParams: {
      headers: {
        Authorization: `Bearer ${stravaAccessToken}`,
      },
    },
  })
  return stravaApi
}

export async function checkStravaAccessToken(userId: number) {
  try {
    const stravaApi = await getStravaApi(userId)
    await (
      await stravaApi.athlete.getLoggedInAthleteActivities({
        per_page: 1,
      })
    ).data
    return true
  } catch (e) {
    console.error('Error: strava check failed')
    console.error(e)
    return false
  }
}

export async function fetchStravaActivity(activityId: number, userId: number) {
  const stravaApi = await getStravaApi(userId)

  const activity = (
    await stravaApi.activities.getActivityById(activityId, {
      include_all_efforts: false,
    })
  ).data
  return activity as DetailedActivity
}

export async function fetchStravaActivityGeoJson(
  activityId: number,
  userId: number
) {
  const stravaApi = await getStravaApi(userId)
  const activityStreams = (
    await stravaApi.activities.getActivityStreams(activityId, {
      keys: ['latlng', 'time', 'heartrate'],
      key_by_type: true,
    })
  ).data

  const activity = await fetchStravaActivity(activityId, userId)
  const geoJson = match(Boolean(activityStreams))
    .with(true, () =>
      new GeoData(
        activity.name,
        JSON.stringify(activityStreams),
        'StravaActivityStream',
        new Date(activity.start_date)
      ).toGeoJson()
    )
    .otherwise(() => null)

  return geoJson
}
