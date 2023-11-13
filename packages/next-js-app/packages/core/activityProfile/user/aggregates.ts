import { sql } from '@trackfootball/database'

interface AggregateUserStatisticsArgs {
  userId: number
  firstDay: Date
  lastDay: Date
}

export type UserStatistics = {
  numberOfSprints: number
  numberOfRuns: number
  totalDistance: number
  elapsedTime: number
  activities: number
}

async function aggregateUserStatistics({
  userId,
  firstDay,
  lastDay,
}: AggregateUserStatisticsArgs): Promise<UserStatistics> {
  const userStatistics = (
    await sql<Array<UserStatistics>>`SELECT
  SUM(jsonb_array_length("Post"."sprints")) as "numberOfSprints", 
  SUM(jsonb_array_length("Post"."runs")) as "numberOfRuns",
  SUM("Post"."totalDistance") as "totalDistance",
  SUM("Post"."elapsedTime") as "elapsedTime",
  COUNT("Post"."id") as "activities"
  
  FROM "Post"
  WHERE "userId"=${userId}
  AND "startTime" >= DATE(${firstDay})
  AND "startTime" <= DATE(${lastDay});
      `
  )[0]
  return userStatistics
}

export function aggregateUserStatisticsThisMonth({
  userId,
}: Pick<AggregateUserStatisticsArgs, 'userId'>) {
  const date = new Date()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return aggregateUserStatistics({
    userId,
    firstDay,
    lastDay,
  })
}

export function aggregateUserStatisticsLastMonth({
  userId,
}: Pick<AggregateUserStatisticsArgs, 'userId'>) {
  const date = new Date()
  const firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth(), 0)
  return aggregateUserStatistics({
    userId,
    firstDay,
    lastDay,
  })
}
