import { importStravaActivity } from '@trackfootball/service'

export async function GET(
  req: Request,
  { params }: { params: { ownerId: string; activityId: string } },
) {
  const { ownerId: ownerIdParam, activityId: activityIdParam } = params

  const ownerId = parseInt(ownerIdParam)
  const activityId = parseInt(activityIdParam)

  if (isNaN(ownerId) || isNaN(activityId)) {
    return Response.json(
      { error: 'Invalid parameters: ownerId and activityId must be numbers' },
      { status: 400 },
    )
  }

  return await importStravaActivity(ownerId, activityId)
}
