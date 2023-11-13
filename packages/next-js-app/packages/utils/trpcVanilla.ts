import { createTRPCClient } from '@trpc/client'
import AbortController from 'abort-controller'
import fetch from 'node-fetch'
import ws from 'ws'

import type { AppRouter } from '../../pages/api/trpc/[trpc]'

// polyfill fetch & websocket
const globalAny = global as any
globalAny.AbortController = AbortController
globalAny.fetch = fetch
globalAny.WebSocket = ws
export const trpc = createTRPCClient<AppRouter>({
  url: (process.env.BACKEND_API || 'https://trackfootball.app/api') + '/trpc',
})
