'use client'

import { useEffect, useState } from 'react'
import { MapInstance } from '@/components/MapInstance'
import invariant from 'tiny-invariant'
import { getBoundsForPoints } from '@/utils'

export function ActivityClient({ post }: { post: any }) {
  const fallbackCoords = {
    latitude: 52.520008,
    longitude: 13.404954,
    zoom: 15,
    bearing: 0,
    pitch: 0,
    padding: {},
  }
  const [viewport, setViewport] = useState(fallbackCoords)

  useEffect(() => {
    async function effect() {
      if (!post) {
        return
      }

      const bounds = await getBoundsForPoints(post)

      const newViewport = {
        bearing: 0,
        pitch: 0,
        padding: {},
        width: '100%',
        height: 350,
        ...bounds,
      }
      setViewport(newViewport)
      console.log({ newViewport })
    }
    effect()
  }, [post])

  invariant(post, `Post with id ${post.id} not found`)
  return (
    <>
      <MapInstance
        key={post.id}
        post={post}
        page="activity"
        isMapMovable={true}
        showHeatmap={true}
        showRuns={false}
        showSprints={false}
        viewport={viewport}
        setViewport={setViewport}
      ></MapInstance>
    </>
  )
}
