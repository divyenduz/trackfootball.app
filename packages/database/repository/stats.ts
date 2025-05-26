import { Field, PostType, User } from '@prisma/client'
import type { FeatureCollection, LineString } from 'geojson'
import { sql } from '../'
import invariant from 'tiny-invariant'

export interface AthleteStats {
  totalActivities: number
  totalDistance: number
  totalSprints: number
  totalRuns: number
  totalTime: number
}

export async function getAthleteStats(userId: number): Promise<AthleteStats> {
  const results: AthleteStats[] = await sql`
    SELECT 
      COUNT(*) as "totalActivities",
      COALESCE(SUM("totalDistance"), 0) as "totalDistance",
      COALESCE(SUM(jsonb_array_length("sprints")), 0) as "totalSprints",
      COALESCE(SUM(jsonb_array_length("runs")), 0) as "totalRuns",
      COALESCE(SUM("elapsedTime"), 0) as "totalTime"
    FROM "Post"
    WHERE "userId" = ${userId}
  `
  const result = results[0]
  invariant(result, `expected result to exist`)
  return result
}

export type AthleteActivity = {
  id: number
  createdAt: Date
  updatedAt: Date
  type: PostType
  text: string
  key: string
  geoJson: FeatureCollection<LineString>
  sprints: Array<FeatureCollection<LineString>>
  runs: Array<FeatureCollection<LineString>>
  totalDistance: number
  elapsedTime: number
  totalSprintTime: number
  maxSpeed: number
  startTime: Date
  endTime: Date
  userId: number
  fieldId: number | null
  processedAt: Date | null
  status: string
  statusInfo: string
  Field: Field
  User: User
}

export async function getAthleteActivities(
  userId: number,
  limit: number = 5,
): Promise<AthleteActivity[]> {
  const activities: AthleteActivity[] = await sql`
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

export async function getUserCount(): Promise<number> {
  const result: { count: number }[] = await sql`SELECT COUNT(*) FROM "User"`
  return result[0]?.count || 0
}

export async function getPostCount(): Promise<number> {
  const result: { count: number }[] = await sql`SELECT COUNT(*) FROM "Post"`
  return result[0]?.count || 0
}
