import * as trpc from '@trpc/server'
import { z } from 'zod'

import { getPost } from '../../../../repository/post'
import { Context } from '../[trpc]'

export type GetPostRouterResponse = NonNullable<
  Awaited<Promise<PromiseLike<ReturnType<typeof getPost>>>>
>

export const getPostRouter = trpc.router<Context>().query('app.getPost', {
  input: z.object({
    id: z.number().positive(),
  }),
  async resolve({ ctx, input: { id } }) {
    const post = await getPost(id)
    if (!post) {
      return {
        notFound: true,
      }
    }
    return { post }
  },
})
