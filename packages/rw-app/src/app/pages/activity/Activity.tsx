import { RequestInfo } from 'rwsdk/worker'
import { ActivityClient } from './ActivityClient'

export async function Activity({ ctx, params }: RequestInfo) {
  const post = await ctx.repository.getPostWithUserAndFields(
    parseInt(params.id, 10)
  )

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">{post.text}</h1>
      <h2 className="text-lg font-semibold mb-2">
        {post.User.firstName} {post.User.lastName}
      </h2>
      <ActivityClient post={post} />
    </>
  )
}
