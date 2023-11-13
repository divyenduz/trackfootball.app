import type { Post } from '@prisma/client'
import * as trpc from '@trpc/server'

import { MESSAGE_UNAUTHORIZED } from '../../../../packages/auth/utils'
import { Context } from '../[trpc]'

export const getPostsWithoutFieldRouter = trpc
  .router<Context>()
  .query('admin.getPostsWithoutField', {
    async resolve({ ctx }) {
      if (!ctx.user) {
        throw new Error(MESSAGE_UNAUTHORIZED)
      }

      if (ctx.user.type !== 'ADMIN') {
        throw new Error(MESSAGE_UNAUTHORIZED)
      }

      const postsWithoutField = await ctx.sql<Post[]>`
      SELECT * FROM "Post"
      WHERE "fieldId" IS NULL
      ORDER BY "id" DESC
      LIMIT 10
      `

      return {
        posts: postsWithoutField,
      }
    },
  })
