import { StravaWebhookEvent, StravaWebhookEventStatus } from '@prisma/client'
import { sql } from '../index'

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

  return stravaWebhookEvents[0]
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
