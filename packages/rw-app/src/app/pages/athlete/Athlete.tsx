import { RequestInfo } from 'rwsdk/worker'
import { ShowToOwner } from '@/components/atoms/ShowToOwner'
import {
  CheckStravaState,
  ConnectWithStravaWidget,
} from '@/components/organisms/ConnectWithStravaWidget'
import { env } from 'cloudflare:workers'
import { checkStravaToken } from './checkStravaToken'

export async function Athlete({ ctx, params }: RequestInfo) {
  const athlete = await ctx.repository.getUser(parseInt(params.id, 10))

  if (!athlete) {
    return <div className="p-4">Athlete not found</div>
  }

  const athleteSocialLogin = await ctx.repository.getUserStravaSocialLogin(
    athlete.id
  )

  const stravaState = (await checkStravaToken({
    ...athlete,
    socialLogin: athleteSocialLogin ? [athleteSocialLogin] : [],
  })) as CheckStravaState

  return (
    <>
      <h1 className="text-2xl font-bold">
        {athlete.firstName} {athlete.lastName}
      </h1>

      <ShowToOwner ownerId={athlete.id} userId={ctx.user?.id}>
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex justify-end">
          <ConnectWithStravaWidget
            redirectTo="athlete"
            backendApiUrl={env.BACKEND_API}
            checkStravaState={stravaState}
          />
        </div>
      </ShowToOwner>
    </>
  )
}
