import { buildRouteMap } from '@stricli/core'
import { WebhookReprocessCommand } from './reprocess'

export const WebhookCommandRoute = buildRouteMap({
  routes: {
    reprocess: WebhookReprocessCommand,
  },
  aliases: {},
  docs: {
    brief: 'CLI for managing Strava webhook events',
    hideRoute: {},
  },
})
