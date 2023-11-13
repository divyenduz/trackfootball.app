import { sql } from '@trackfootball/database'
import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'

import { getCurrentUser } from '../../../packages/auth/utils'
import { getFieldsRouter, getPostsWithoutFieldRouter } from './admin'
import {
  integrationStravaDisconnectRouter,
  postDeleteRouter,
  postRefreshRouter,
} from './mutations'
import {
  feedRouter,
  getPostRouter,
  meRouter,
  systemRouter,
  userSocialCheckStravaRouter,
} from './queries'

const appRouter = trpc
  .router<Context>()
  // Admin
  .merge(getPostsWithoutFieldRouter)
  .merge(getFieldsRouter)
  // Queries
  .merge(meRouter)
  .merge(feedRouter)
  .merge(getPostRouter)
  .merge(userSocialCheckStravaRouter)
  .merge(systemRouter)
  // Mutations
  .merge(postDeleteRouter)
  .merge(postRefreshRouter)
  .merge(integrationStravaDisconnectRouter)

// export type definition of API
export type AppRouter = typeof appRouter

export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions
) => {
  //@ts-expect-error
  const user = await getCurrentUser(opts?.req, opts?.res)
  return {
    user,
    sql,
  }
}
export type Context = trpc.inferAsyncReturnType<typeof createContext>

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
})
