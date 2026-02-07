import React, { useEffect, useRef, useState } from 'react'
import type { ViewState } from 'react-map-gl/mapbox'
import { match } from 'ts-pattern'

import { Map } from './Map'
import type { Field, Post } from '@trackfootball/postgres'

type ViewPort = ViewState & {
  width?: number
  height?: number
}

interface MapInstanceProps {
  isMapMovable: boolean
  viewport: ViewPort
  setViewport: React.Dispatch<React.SetStateAction<ViewPort>>
  showSprints: boolean
  showRuns: boolean
  showHeatmap: boolean
  post: Post & {
    Field: Field
  }
  page: 'activity' | 'feed'
}

export const MapInstance: React.FC<MapInstanceProps> = ({
  isMapMovable,
  viewport,
  setViewport,
  showSprints,
  showRuns,
  showHeatmap,
  post,
  page,
}) => {
  const [mapStyle, setMapStyle] = useState(
    'mapbox://styles/mapbox/outdoors-v12'
  )
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)

  const mapStyles = [
    {
      id: 'mapbox://styles/mapbox/outdoors-v12',
      name: 'Streets',
      icon: 'L', // <Layers fontSize="small" />,
    },
    {
      id: 'mapbox://styles/mapbox/satellite-streets-v12',
      name: 'Satellite',
      icon: 'T', // <Terrain fontSize="small" />,
    },
  ]

  const field = post.Field

  // Add effect to handle map load and redraws
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      // Force redraw of layers when map is loaded
      const mapInstance = mapRef.current as any
      if (mapInstance && mapInstance.getMap) {
        const map = mapInstance.getMap()
        if (map) {
          map.resize()
        }
      }
    }
  }, [mapLoaded])

  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      const timeoutId = setTimeout(() => {
        const currentViewport = { ...viewport }
        setViewport({
          ...currentViewport,
          zoom: currentViewport.zoom + 0.0001,
        })
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [mapLoaded, viewport, setViewport])

  return (
    <>
      {match(page)
        .with('activity', () => (
          <div className="flex flex-row justify-start gap-2 my-4 rounded-md bg-gray-50 p-2">
            <div className="text-xs text-gray-500 flex items-center mr-2">
              Map style:
            </div>
            {mapStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setMapStyle(style.id)}
                className={`flex items-center px-3 py-1.5 text-xs rounded-md transition-colors ${
                  mapStyle === style.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{style.icon}</span>
                {style.name}
              </button>
            ))}
          </div>
        ))
        .otherwise(() => null)}

      {Boolean(field && page === 'activity') && (
        <div className="mb-2 p-2 bg-gray-50 rounded-md">
          <div className="flex items-center">
            <span className="text-purple-600 mr-1">⚽</span>
            <span className="font-medium">{field?.name}</span>
            <span className="text-gray-500 text-sm ml-2">({field?.usage})</span>
          </div>
        </div>
      )}

      <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 mb-2 sm:mb-4">
        <Map
          isMapMovable={isMapMovable}
          viewport={viewport}
          mapStyle={mapStyle}
          setViewport={setViewport}
          showSprints={showSprints}
          showRuns={showRuns}
          showHeatmap={showHeatmap}
          post={post}
          page={page}
        ></Map>
      </div>
    </>
  )
}
