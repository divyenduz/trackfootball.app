import type { Field, Post, User } from '@prisma/client'
import * as trpc from '@trpc/server'
import { z } from 'zod'

import { MESSAGE_UNAUTHORIZED } from '../../../../../packages/auth/utils'
import { Context } from '../../../../../pages/api/trpc/[trpc]'

export const feedRouter = trpc.router<Context>().query('user.feed', {
  input: z.object({
    limit: z.number().positive(),
    cursor: z.number().nullish(),
  }),
  async resolve({ ctx, input: { limit, cursor } }) {
    if (!ctx.user) {
      throw new Error(MESSAGE_UNAUTHORIZED)
    }

    type FeedItem = Post & {
      Field: Field
      User: User
    }
    const maxPostId = (
      await ctx.sql<{ max: number }[]>`SELECT MAX("id") FROM "Post"`
    )[0].max

    const posts = await ctx.sql<FeedItem[]>`
    SELECT row_to_json("Field".*::"Field") as "Field", row_to_json("User".*::"User") as "User", "Post".* FROM "Post"
    LEFT JOIN "Field" ON "Post"."fieldId" = "Field"."id"
    INNER JOIN "User" ON "Post"."userId" = "User"."id"
    WHERE "Post"."id" <= ${cursor || maxPostId}
    ORDER BY "Post"."startTime" DESC
    LIMIT ${limit + 1}
    `

    let nextCursor: typeof cursor | null = null
    const sortedPosts = posts.slice().sort((a, b) => b.id - a.id)
    if (sortedPosts.length > limit) {
      const nextItem = sortedPosts.pop()
      nextCursor = nextItem!.id
    }

    return { posts: sortedPosts, nextCursor }
  },
})
