'use client'

import type { Post, User } from '@trackfootball/postgres'
import { useState, useRef, useEffect } from 'react'
import { getFeed } from './feed'

type FeedPost = Awaited<ReturnType<typeof getFeed>>['posts'][number]

interface FeedWithUser extends FeedPost {
  User: User
}

interface FeedContainerProps {
  initialPosts: FeedWithUser[]
  initialNextCursor: number | null
  currentUser: User | null
}

export function FeedContainer({
  initialPosts,
  initialNextCursor,
  currentUser,
}: FeedContainerProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [nextCursor, setNextCursor] = useState(initialNextCursor)
  const [loading, setLoading] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const handleDelete = async (postId: number) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setPosts(posts.filter((p) => p.id !== postId))
          setOpenDropdown(null)
        }
      } catch (error) {
        console.error('Error deleting post:', error)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2)
  }

  const formatSpeed = (mps: number) => {
    return (mps * 3.6).toFixed(1) + ' km/h'
  }

  const formatDateTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days === 0) {
      if (hours === 0) {
        const mins = Math.floor(diff / (1000 * 60))
        return mins <= 1 ? 'Just now' : `${mins} minutes ago`
      }
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`
    } else if (days === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}`
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const f = firstName?.[0] || ''
    const l = lastName?.[0] || ''
    return (f + l).toUpperCase() || 'U'
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {posts.map((post) => (
        <a
          key={post.id}
          href={`/activity/${post.id}`}
          className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        >
          {/* Header */}
          <div className="p-4 pb-3 border-b border-gray-100">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {getInitials(post.User.firstName, post.User.lastName)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {post.User.firstName} {post.User.lastName}
                  </h3>
                  <div
                    className="ml-auto relative"
                    ref={openDropdown === post.id ? dropdownRef : null}
                  >
                    <button
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        setOpenDropdown(
                          openDropdown === post.id ? null : post.id,
                        )
                      }}
                    >
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openDropdown === post.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 py-1">
                        <a
                          href={`https://strava.com/activities/${post.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          View in Strava
                        </a>
                        {currentUser?.type === 'ADMIN' && (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleDelete(post.id)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Delete Activity
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  <span>{formatDateTime(new Date(post.createdAt))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Title */}
          <div className="px-4 pt-3 pb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {post.text || 'Football Activity'}
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-xl font-semibold text-gray-900">
                  {post.elapsedTime ? formatTime(post.elapsedTime) : '--'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Distance</div>
                <div className="text-xl font-semibold text-gray-900">
                  {post.totalDistance
                    ? `${formatDistance(post.totalDistance)} km`
                    : '-- km'}
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap Preview - uncomment when heatmapUrl is available */}
          {/* {post.heatmapUrl && (
            <div className="px-4 pb-4">
              <img 
                src={post.heatmapUrl} 
                alt="Activity heatmap" 
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )} */}
        </a>
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
