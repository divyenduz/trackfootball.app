import { RequestInfo } from 'rwsdk/worker'

export async function Dashboard({ ctx }: RequestInfo) {
  const feed = await ctx.repository.getFeed()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <a href={`/activity/${post.id}`} className="block">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {post.text}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      post.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : post.status === 'PROCESSING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : post.status === 'ERROR'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {post.status.toLowerCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {post.totalDistance && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-rose-600">
                        {formatDistance(post.totalDistance)}
                      </div>
                      <div className="text-sm text-gray-500">Distance</div>
                    </div>
                  )}

                  {post.elapsedTime && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-rose-600">
                        {formatTime(post.elapsedTime)}
                      </div>
                      <div className="text-sm text-gray-500">Duration</div>
                    </div>
                  )}

                  {post.maxSpeed && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-rose-600">
                        {formatSpeed(post.maxSpeed)}
                      </div>
                      <div className="text-sm text-gray-500">Max Speed</div>
                    </div>
                  )}

                  {post.totalSprintTime && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-rose-600">
                        {formatTime(post.totalSprintTime)}
                      </div>
                      <div className="text-sm text-gray-500">Sprint Time</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    {post.startTime && (
                      <span>
                        {new Date(post.startTime).toLocaleDateString()}
                      </span>
                    )}
                    {post.type && (
                      <span className="capitalize">
                        {post.type.toLowerCase().replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </a>
          </div>
        )
      })}
    </div>
  )
}
