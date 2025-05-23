import { Field, PostType, User } from '@prisma/client'
import { FeatureCollection, LineString } from '@turf/helpers'
import { sql } from '../'

export interface AthleteStats {
  totalActivities: number
  totalDistance: number
  totalSprints: number
  maxSpeed: number
  totalTime: number
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

export async function getAthleteStats(userId: number): Promise<AthleteStats> {
  const result: AthleteStats[] = await sql`
    SELECT 
      COUNT(*) as "totalActivities",
      COALESCE(SUM("totalDistance"), 0) as "totalDistance",
      COALESCE(SUM(jsonb_array_length("sprints")), 0) as "totalSprints",
      0 as "maxSpeed",
      COALESCE(SUM("elapsedTime"), 0) as "totalTime"
    FROM "Post"
    WHERE "userId" = ${userId}
  `

  try {
    const rows: { id: number; text: string; maxSpeed: number }[] = await sql`
      SELECT "id", "text", "maxSpeed" 
      FROM "Post" 
      WHERE "userId" = ${userId} 
        AND "maxSpeed" IS NOT NULL 
        AND "maxSpeed" != 'NaN'
        AND "maxSpeed"::text NOT LIKE '%null%' 
        AND "maxSpeed" > 0 
      ORDER BY "maxSpeed" DESC 
      LIMIT 1
    `

    if (rows.length > 0 && rows[0].maxSpeed) {
      result[0].maxSpeed = Number(rows[0].maxSpeed)
      console.log('Found max speed:', rows[0].maxSpeed, 'for user:', userId)
    }
  } catch (error) {
    console.error('Error getting max speed:', error)
  }

  return (
    result[0] || {
      totalActivities: 0,
      totalDistance: 0,
      totalSprints: 0,
      maxSpeed: 0,
      totalTime: 0,
    }
  )
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
  return result[0].count
}

export async function getPostCount(): Promise<number> {
  const result: { count: number }[] = await sql`SELECT COUNT(*) FROM "Post"`
  return result[0].count
}
