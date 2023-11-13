import { Post, PostStatus, User } from '@prisma/client'
import { Core } from '@trackfootball/sprint-detection'
import { durationToSeconds } from '@trackfootball/utils'
import * as trpc from '@trpc/server'
import { z } from 'zod'

import { MESSAGE_UNAUTHORIZED } from '../../../../packages/auth/utils'
import { postAddField } from '../../../../packages/services/post/addField'
import { fetchStravaActivityGeoJson } from '../../../../repository/strava'
import { Context } from '../[trpc]'

export const postRefreshRouter = trpc
  .router<Context>()
  .mutation('post.refresh', {
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

      if (ctx.user.id !== post?.userId && ctx.user.type !== 'ADMIN') {
        throw new Error(MESSAGE_UNAUTHORIZED)
      }

      if (!post) {
        throw new Error('Post not found')
      }

      const ownerUser = (
        await ctx.sql<User[]>`
      SELECT * FROM "User"
      WHERE "id" = ${post.userId}
      `
      )[0]

      const _key = parseInt(post.key)
      const geoJson = await fetchStravaActivityGeoJson(_key, ownerUser.id)

      if (geoJson instanceof Error) {
        throw geoJson
      }

      if (!geoJson) {
        throw new Error(`No geoJson found for Post id: ${postId}`)
      }
      const core = new Core(geoJson)

      const updatedPost = (
        await ctx.sql<Post[]>`
      UPDATE "Post"
      SET "geoJson" = ${geoJson as any},
      "totalDistance" = ${core.totalDistance()},
      "startTime" = ${new Date(core.getStartTime())},
      "elapsedTime" = ${durationToSeconds(core.elapsedTime())},
      "totalSprintTime" = ${durationToSeconds(core.totalSprintTime())},
      "sprints" = ${core.sprints() as any},
      "runs" = ${core.runs() as any},
      "maxSpeed" = ${core.maxSpeed()},
      "averageSpeed" = ${core.averageSpeed()},
      "status" = ${PostStatus.COMPLETED}
      WHERE "id" = ${postId}
      RETURNING *
      `
      )[0]

      await postAddField({
        postId: post.id,
      })

      return { post: updatedPost }
    },
  })
