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
      <title>{`${post.text} - Activity | TrackFootball.app`}</title>
      <meta name="description" content={`View ${post.User.firstName} ${post.User.lastName}'s football activity: ${post.text}. Analyze performance metrics and training data on TrackFootball.`} />
      <h1 className="text-2xl font-bold">{post.text}</h1>
      <h2 className="text-base text-gray-500 mb-6">
        {post.User.firstName} {post.User.lastName}
      </h2>
      <ActivityClient post={post} />
    </>
  )
}
