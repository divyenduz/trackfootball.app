import { sql } from '@trackfootball/database'

export type Column =
  | 'totalDistance'
  | 'numberOfSprints'
  | 'numberOfRuns'
  | 'elapsedTime'

export interface AllTimeMetric {
  id: number
  postId: number
  userId: number
  metric: number
  startTime: string
  type: Column
}

export async function getPersonalRecords(userId: number) {
  const totalDistance = await getAllTimeMaximumTotalDistance(userId)
  const numberOfSprints = await getAllTimeMaximumSprints(userId)
  const numberOfRuns = await getAllTimeMaximumRuns(userId)
  const elapsedTime = await getAllTimeMaximumElapsedTime(userId)

  return {
    totalDistance,
    numberOfSprints,
    numberOfRuns,
    elapsedTime,
  }
}

async function getAllTimeMaximumTotalDistance(userId: number) {
  const metrics = await sql<Array<AllTimeMetric>>`
WITH MetricTable as (
  SELECT
    "id" AS "postId",
    "userId",
    "totalDistance" AS "metric",
    "startTime",
    'totalDistance' AS "type"
  FROM
    "Post"
  WHERE
    "userId" = ${userId}
)
SELECT * FROM MetricTable 
WHERE metric = (SELECT MAX(metric) FROM MetricTable)`

  if (metrics.length > 0) {
    return metrics[0]
  } else {
    return null
  }
}

async function getAllTimeMaximumElapsedTime(userId: number) {
  const metrics = await sql<Array<AllTimeMetric>>`
WITH MetricTable as (
  SELECT
    "id" AS "postId",
    "userId",
    "elapsedTime" AS "metric",
    "startTime",
    'elapsedTime' AS "type"
  FROM
    "Post"
  WHERE
    "userId" = ${userId}
)
SELECT * FROM MetricTable 
WHERE metric = (SELECT MAX(metric) FROM MetricTable)`

  if (metrics.length > 0) {
    return metrics[0]
  } else {
    return null
  }
}

async function getAllTimeMaximumSprints(userId: number) {
  const metrics = await sql<Array<AllTimeMetric>>`
WITH MetricTable as (
  SELECT
    "id" AS "postId",
    "userId",
    jsonb_array_length("Post"."sprints") AS "metric",
    "startTime",
    'numberOfSprints' AS "type"
  FROM
    "Post"
  WHERE
    "userId" = ${userId}
)
SELECT * FROM MetricTable 
WHERE metric = (SELECT MAX(metric) FROM MetricTable)`

  if (metrics.length > 0) {
    return metrics[0]
  } else {
    return null
  }
}

async function getAllTimeMaximumRuns(userId: number) {
  const metrics = await sql<Array<AllTimeMetric>>`
WITH MetricTable as (
  SELECT
    "id" AS "postId",
    "userId",
    jsonb_array_length("Post"."runs") AS "metric",
    "startTime",
    'numberOfRuns' AS "type"
  FROM
    "Post"
  WHERE
    "userId" = ${userId}
)
SELECT * FROM MetricTable 
WHERE metric = (SELECT MAX(metric) FROM MetricTable)`

  if (metrics.length > 0) {
    return metrics[0]
  } else {
    return null
  }
}
