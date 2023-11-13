import type { Post } from '@prisma/client'
import * as trpc from '@trpc/server'
import { z } from 'zod'

import { MESSAGE_UNAUTHORIZED } from '../../../../packages/auth/utils'
import { Context } from '../[trpc]'

export const postDeleteRouter = trpc.router<Context>().mutation('post.delete', {
  input: z.object({
    postId: z.number().nonnegative(),
  }),
  async resolve({ ctx, input: { postId } }) {
    if (!ctx.user) {
      throw new Error(MESSAGE_UNAUTHORIZED)
    }

    const post = (
      await ctx.sql<Post[]>`
      SELECT * FROM "Post"
      WHERE "id" = ${postId}
      `
    )[0]

    if (post?.userId !== ctx.user.id && ctx.user.type !== 'ADMIN') {
      throw new Error(MESSAGE_UNAUTHORIZED)
    }

    const deletePost = (
      await ctx.sql<Post[]>`
    DELETE FROM "Post"
    WHERE "id" = ${postId}
    RETURNING *
    `
    )[0]

    return { post: deletePost }
  },
})
