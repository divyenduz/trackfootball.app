import { buildApplication, buildRouteMap } from '@stricli/core'
import { ActivityCommandRoute } from './commands/activity'
import { WebhookCommandRoute } from './commands/webhook'

const routes = buildRouteMap({
  routes: {
    activity: ActivityCommandRoute,
    webhook: WebhookCommandRoute,
  },
  aliases: {},
  docs: {
    brief: 'CLI for managing TrackFootball',
    hideRoute: {},
  },
})

export const app = buildApplication(routes, {
  name: 'TrackFootball CLI',
  versionInfo: {
    currentVersion: '0.0.0',
    getLatestVersion: () => Promise.resolve('0.0.0'),
    upgradeCommand: 'dbdev upgrade',
  },
  documentation: {},
})
