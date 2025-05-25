import { StravaWebhookEvent, StravaWebhookEventStatus } from '@prisma/client'
import { sql } from '../index'
import invariant from 'tiny-invariant'

interface CreateStravaWebhookEventInput {
  status: StravaWebhookEventStatus
  body: string
  errors: any[]
}

export async function createStravaWebhookEvent(
  input: CreateStravaWebhookEventInput,
): Promise<StravaWebhookEvent> {
  const data = {
    ...input,
    updatedAt: sql`now()`,
  }

  const stravaWebhookEvents: StravaWebhookEvent[] = await sql`
    INSERT INTO "public"."StravaWebhookEvent" ${
      //@ts-expect-error
      sql(data)
    }
    RETURNING *
  `
  const stravaWebhookEvent = stravaWebhookEvents[0]
  invariant(stravaWebhookEvent, 'expected createStravaWebhookEvent to exist')
  return stravaWebhookEvent
}

export async function updateStravaWebhookEventStatus(
  id: number,
  status: StravaWebhookEventStatus,
): Promise<void> {
  await sql`
    UPDATE "StravaWebhookEvent" 
    SET "status" = ${status} 
    WHERE "id" = ${id}
  `
}

export async function deleteStravaWebhookEvent(id: number): Promise<void> {
  await sql`
    DELETE FROM "StravaWebhookEvent" 
    WHERE "id" = ${id}
  `
}

export async function findStravaWebhookEventByActivityId(
  activityId: number,
): Promise<StravaWebhookEvent | null> {
  const events: StravaWebhookEvent[] = await sql`
    SELECT * FROM "StravaWebhookEvent" 
    WHERE "body"::jsonb ->> 'object_id' = ${activityId.toString()}
    AND "status" = 'PENDING'
    LIMIT 1
  `

  return events[0] || null
}
