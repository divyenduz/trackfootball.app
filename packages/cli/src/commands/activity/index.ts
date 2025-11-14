import { buildRouteMap } from '@stricli/core'
import { ActivityRefreshCommand } from './refresh'
import { ActivityDeleteCommand } from './delete'

export const ActivityCommandRoute = buildRouteMap({
  routes: {
    refresh: ActivityRefreshCommand,
    delete: ActivityDeleteCommand,
  },
  aliases: {},
  docs: {
    brief: 'CLI for managing TrackFootball activities',
    hideRoute: {},
  },
})
