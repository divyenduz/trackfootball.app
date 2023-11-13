import * as trpc from '@trpc/server'

import { MESSAGE_UNAUTHORIZED } from '../../../../packages/auth/utils'
import { Context } from '../[trpc]'

export const meRouter = trpc.router<Context>().query('app.me', {
  resolve({ ctx }) {
    if (!ctx.user) {
      throw new Error(MESSAGE_UNAUTHORIZED)
    }
    return { user: ctx.user }
  },
})
