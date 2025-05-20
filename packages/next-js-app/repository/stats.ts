import { Field, Post, User, sql } from '@trackfootball/database'
import { FeatureCollection, LineString } from '@turf/helpers'

export interface AthleteStats {
  totalActivities: number
  totalDistance: number
  totalSprints: number
  maxSpeed: number
  totalTime: number
}

export type AthleteActivity = Post & {
  geoJson: FeatureCollection<LineString>
  sprints: Array<FeatureCollection<LineString>>
  runs: Array<FeatureCollection<LineString>>
  Field: Field
  User: User
}

export async function getAthleteStats(userId: number): Promise<AthleteStats> {
  const result = await sql<AthleteStats[]>`
    SELECT 
      COUNT(*) as "totalActivities",
      COALESCE(SUM("totalDistance"), 0) as "totalDistance",
      COALESCE(SUM(jsonb_array_length("sprints")), 0) as "totalSprints",
      COALESCE(MAX("maxSpeed"), 0) as "maxSpeed",
      COALESCE(SUM("elapsedTime"), 0) as "totalTime"
    FROM "Post"
    WHERE "userId" = ${userId}
  `

  return result[0] || {
    totalActivities: 0,
    totalDistance: 0,
    totalSprints: 0,
    maxSpeed: 0,
    totalTime: 0,
  }
}

export async function getAthleteActivities(userId: number, limit: number = 5): Promise<AthleteActivity[]> {
  const activities = await sql<AthleteActivity[]>`
    SELECT row_to_json("Field".*::"Field") as "Field", row_to_json("User".*::"User") as "User", "Post".* 
    FROM "Post"
    LEFT JOIN "Field" ON "Post"."fieldId" = "Field"."id"
    INNER JOIN "User" ON "Post"."userId" = "User"."id"
    WHERE "Post"."userId" = ${userId}
    ORDER BY "Post"."startTime" DESC
    LIMIT ${limit}
  `

  return activities
}