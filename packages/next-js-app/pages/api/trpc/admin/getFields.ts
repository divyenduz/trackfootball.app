import type { Field } from '@prisma/client'
import * as trpc from '@trpc/server'

import { MESSAGE_UNAUTHORIZED } from '../../../../packages/auth/utils'
import { Context } from '../[trpc]'

export const getFieldsRouter = trpc.router<Context>().query('admin.getFields', {
  async resolve({ ctx }) {
    if (!ctx.user) {
      throw new Error(MESSAGE_UNAUTHORIZED)
    }

    if (ctx.user.type !== 'ADMIN') {
      throw new Error(MESSAGE_UNAUTHORIZED)
    }

    const fields = await ctx.sql<Field[]>`
      SELECT * FROM "Field"
      ORDER BY "id" DESC
      `

    return {
      fields,
    }
  },
})
