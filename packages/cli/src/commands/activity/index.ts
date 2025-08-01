import { buildRouteMap } from '@stricli/core'
import { ActivityRefreshCommand } from './refresh'

export const ActivityCommandRoute = buildRouteMap({
  routes: {
    refresh: ActivityRefreshCommand,
  },
  aliases: {},
  docs: {
    brief: 'CLI for managing TrackFootball activities',
    hideRoute: {},
  },
})
