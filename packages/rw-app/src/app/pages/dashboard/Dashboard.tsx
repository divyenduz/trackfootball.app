import { RequestInfo } from 'rwsdk/worker'

export async function Dashboard({ ctx }: RequestInfo) {
  const feed = await ctx.repository.getFeed()

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-3">
      {feed.posts.map((post) => {
        const formatTime = (seconds: number) => {
          const mins = Math.floor(seconds / 60)
          const secs = seconds % 60
          return `${mins}:${secs.toString().padStart(2, '0')}`
        }

        const formatDistance = (meters: number) => {
          return (meters / 1000).toFixed(2) + ' km'
        }

        const formatSpeed = (mps: number) => {
          return (mps * 3.6).toFixed(1) + ' km/h'
        }

        return (
          <div
            key={post.id}
            className="bg-white border border-gray-300 hover:border-black transition-colors"
          >
            <a href={`/activity/${post.id}`} className="block">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-black">
                    {post.text}
                  </h3>
                  {post.status !== 'COMPLETED' && (
                    <span className="px-2 py-1 text-xs border border-black text-black">
                      {post.status.toLowerCase()}
                    </span>
                  )}
                </div>

                <div className="flex gap-6 mb-3">
                  {post.totalDistance ? (
                    <div>
                      <div className="text-lg font-bold text-black">
                        {formatDistance(post.totalDistance)}
                      </div>
                      <div className="text-xs text-gray-600">Distance</div>
                    </div>
                  ) : (
                    <></>
                  )}

                  {post.elapsedTime ? (
                    <div>
                      <div className="text-lg font-bold text-black">
                        {formatTime(post.elapsedTime)}
                      </div>
                      <div className="text-xs text-gray-600">Duration</div>
                    </div>
                  ) : (
                    <></>
                  )}

                  {post.maxSpeed ? (
                    <div>
                      <div className="text-lg font-bold text-black">
                        {formatSpeed(post.maxSpeed)}
                      </div>
                      <div className="text-xs text-gray-600">Max Speed</div>
                    </div>
                  ) : (
                    <></>
                  )}

                  {post.totalSprintTime ? (
                    <div>
                      <div className="text-lg font-bold text-black">
                        {formatTime(post.totalSprintTime)}
                      </div>
                      <div className="text-xs text-gray-600">Sprint Time</div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    {post.startTime && (
                      <span>
                        {new Date(post.startTime).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <span>{new Date(post.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </a>
          </div>
        )
      })}
    </div>
  )
}
