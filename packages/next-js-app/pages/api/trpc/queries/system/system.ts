import * as trpc from '@trpc/server'

import { Context } from '../../../../../pages/api/trpc/[trpc]'

export const systemRouter = trpc
  .router<Context>()
  .query('system.backendApiUrl', {
    async resolve() {
      const backendApiUrl =
        process.env.BACKEND_API || 'https://trackfootball.app/api'
      return { backendApiUrl }
    },
  })
  .query('system.homepageUrl', {
    async resolve() {
      const homepageUrl =
        process.env.HOMEPAGE_URL || 'https://trackfootball.app'
      return { homepageUrl }
    },
  })
