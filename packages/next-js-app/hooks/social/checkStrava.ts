import { useEffect, useState } from 'react'

import { trpc } from '../../packages/utils/trpcReact'
import { CheckStravaState } from '../../pages/api/trpc/queries/user/social/checkStrava'

export function useCheckStrava() {
  const [checkStravaState, setCheckStravaState] =
    useState<CheckStravaState>('LOADING')
  const checkStravaQuery = trpc.useQuery(['user.social.checkStrava'])

  useEffect(() => {
    if (!checkStravaQuery.isLoading) {
      setCheckStravaState(checkStravaQuery.data || 'NOT_CONNECTED')
    }
  }, [checkStravaQuery.isLoading, checkStravaQuery.data])

  return {
    checkStravaState,
  }
}
