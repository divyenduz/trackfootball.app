'use client'

import { Post, User } from '@trackfootball/kanel'
import { useState } from 'react'
import { getFeed } from './feed'

interface FeedWithUser extends Post {
  User: User
}

interface FeedContainerProps {
  initialPosts: FeedWithUser[]
  initialNextCursor: number | null
}

export function FeedContainer({
  initialPosts,
  initialNextCursor,
}: FeedContainerProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [nextCursor, setNextCursor] = useState(initialNextCursor)
  const [loading, setLoading] = useState(false)

  const loadMore = async () => {
    if (!nextCursor || loading) return

    setLoading(true)
    try {
      const data = await getFeed(nextCursor)
      setPosts((prev) => [...prev, ...data.posts])
      setNextCursor(data.nextCursor)
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoading(false)
    }
  }

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
    <div className="max-w-4xl mx-auto p-4 space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white border border-gray-300 hover:border-black transition-colors"
        >
          <a href={`/activity/${post.id}`} className="block">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    {post.User.firstName} {post.User.lastName}
                  </div>
                  <h3 className="text-base font-medium text-black">
                    {post.text}
                  </h3>
                </div>
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
                ) : null}

                {post.elapsedTime ? (
                  <div>
                    <div className="text-lg font-bold text-black">
                      {formatTime(post.elapsedTime)}
                    </div>
                    <div className="text-xs text-gray-600">Duration</div>
                  </div>
                ) : null}

                {post.maxSpeed ? (
                  <div>
                    <div className="text-lg font-bold text-black">
                      {formatSpeed(post.maxSpeed)}
                    </div>
                    <div className="text-xs text-gray-600">Max Speed</div>
                  </div>
                ) : null}

                {post.totalSprintTime ? (
                  <div>
                    <div className="text-lg font-bold text-black">
                      {formatTime(post.totalSprintTime)}
                    </div>
                    <div className="text-xs text-gray-600">Sprint Time</div>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  {post.startTime && (
                    <span>{new Date(post.startTime).toLocaleDateString()}</span>
                  )}
                </div>
                <span>{new Date(post.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </a>
        </div>
      ))}

      {nextCursor && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 border border-black text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}
