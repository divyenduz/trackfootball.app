import { repository } from '@trackfootball/database'
import { importStravaActivity } from '@trackfootball/service'
import { ensureUser } from 'packages/utils/utils'
import { MESSAGE_UNAUTHORIZED } from 'packages/auth/utils'
import { auth } from 'utils/auth'

export async function GET(
  req: Request,
  props: { params: Promise<{ activityId: string }> },
) {
  const params = await props.params
  const { activityId: activityIdParam } = params

  const activityId = parseInt(activityIdParam)

  if (isNaN(activityId)) {
    return Response.json(
      { error: 'Invalid parameter: activityId must be a number' },
      { status: 400 },
    )
  }

  const user = await auth()
  console.log(user)
  if (!ensureUser(user)) {
    return new Response(MESSAGE_UNAUTHORIZED, {
      status: 401,
    })
  }

  const stravaSocialLogin = await repository.getUserStravaSocialLogin(user.id)
  if (!stravaSocialLogin) {
    return Response.json(
      {
        error:
          'No Strava account connected. Please connect your Strava account first.',
      },
      { status: 400 },
    )
  }

  const ownerId = parseInt(stravaSocialLogin.platformId)
  if (isNaN(ownerId)) {
    return Response.json(
      { error: 'Invalid Strava account configuration' },
      { status: 500 },
    )
  }

  return await importStravaActivity(ownerId, activityId, 'MANUAL')
}
