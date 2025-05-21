import { ArrowUpward, Layers, Terrain } from '@mui/icons-material'
import { Core } from '@trackfootball/sprint-detection'
import { FieldSpace } from '@trackfootball/sprint-detection'
import bearing from '@turf/bearing'
import { FeatureCollection, LineString, bearingToAzimuth } from '@turf/helpers'
import { FeedItemType } from 'app/actions/getFeed'
import dynamic from 'next/dynamic'
import React, { useEffect, useRef, useState } from 'react'
import type { ViewState } from 'react-map-gl/mapbox'
import { match } from 'ts-pattern'

import { getNthCoord } from '../../packages/utils/map'
import { namedComponent } from '../../packages/utils/utils'
import { ConditionalDisplay } from '../atoms/ConditionalDisplay'
import { AwaitedPost } from './Activity/ActivityItem'

type MapInstancePost = FeedItemType | AwaitedPost

const ReactMapGL = dynamic(() => import('react-map-gl/mapbox'), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center bg-gray-100 rounded-md"
      style={{ height: '350px' }}
    >
      <div className="text-gray-500 flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-2"></div>
        <p>Loading map...</p>
      </div>
    </div>
  ),
})

const Layer = dynamic(() =>
  namedComponent(import('react-map-gl/mapbox'), 'Layer')
)
const Marker = dynamic(() =>
  namedComponent(import('react-map-gl/mapbox'), 'Marker')
)
const NavigationControl = dynamic(() =>
  namedComponent(import('react-map-gl/mapbox'), 'NavigationControl')
)
const Source = dynamic(() =>
  namedComponent(import('react-map-gl/mapbox'), 'Source')
)

type ViewPort = ViewState & {
  width?: number
  height?: number
}

interface MapInstanceProps {
  isMapMovable: boolean
  viewport: ViewPort
  setViewport: React.Dispatch<React.SetStateAction<ViewPort>>
  topSprintOnly: boolean
  showSprints: boolean
  showRuns: boolean
  showHeatmap: boolean
  post: MapInstancePost
  page: 'activity' | 'feed'
}

interface ArrowIconProps {
  color: 'red' | 'yellow'
  bearingValue: number
}

function postIsFullPost(post: MapInstancePost): post is AwaitedPost {
  if ('numberOfCoordinates' in post) {
    return true
  }
  return false
}

const ArrowIcon: React.FC<ArrowIconProps> = ({ color, bearingValue }) => {
  return (
    <ArrowUpward
      style={{
        position: 'relative',
        color,
        fontSize: '30px',
        transform: 'rotate(' + bearingValue + 'deg)',
        left: -15,
        top: -15,
      }}
    />
  )
}

function getHeatmapRadius(post: MapInstancePost) {
  if (postIsFullPost(post)) {
    const heatmapRadius = 25000 / post.numberOfCoordinates
    if (heatmapRadius < 3) {
      return 3
    }
    if (heatmapRadius > 10) {
      return 10
    }
    return heatmapRadius
  } else {
    return 5
  }
}

export const MapInstance: React.FC<MapInstanceProps> = ({
  isMapMovable,
  viewport,
  setViewport,
  topSprintOnly,
  showSprints,
  showRuns,
  showHeatmap,
  post,
  page,
}) => {
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11')
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)

  const mapStyles = [
    {
      id: 'mapbox://styles/mapbox/streets-v11',
      name: 'Streets',
      icon: <Layers fontSize="small" />,
    },
    {
      id: 'mapbox://styles/mapbox/satellite-v9',
      name: 'Satellite',
      icon: <Terrain fontSize="small" />,
    },
  ]

  const field = post.Field

  const fieldData = match(Boolean(field))
    .with(true, () => {
      const fieldSpace = new FieldSpace(field!)
      const fieldBearing = fieldSpace.fieldBearing()
      const fieldEnvelope = fieldSpace.fieldFeatureCollection()
      return {
        fieldBearing,
        fieldEnvelope,
      }
    })
    .with(false, () => null)
    .exhaustive()

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

  // Add effect to handle viewport changes
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      // Slightly modify viewport to trigger a rerender
      const timeoutId = setTimeout(() => {
        const currentViewport = { ...viewport }
        // Imperceptible change to force redraw
        setViewport({
          ...currentViewport,
          zoom: currentViewport.zoom + 0.0001,
        })
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [mapLoaded, viewport, setViewport])

  const core = new Core(
    post.geoJson! as unknown as FeatureCollection<LineString>
  )

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

      <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 mb-4">
        <ReactMapGL
          ref={mapRef}
          className="map-instance"
          scrollZoom={false}
          touchZoom={false}
          doubleClickZoom={isMapMovable}
          dragPan={isMapMovable}
          // @ts-expect-error unify viewport properties
          bearing={fieldData?.fieldBearing || 0}
          onMove={(evt: any) => setViewport(evt.viewState)}
          onLoad={() => {
            console.log('Map loaded')
            setMapLoaded(true)
          }}
          touchAction={'pan-y'}
          mapStyle={mapStyle}
          style={{ height: 350 }}
          mapboxAccessToken="pk.eyJ1IjoiZGl2eWVuZHV6IiwiYSI6ImNqeTRvc212NzEzdXczY2syam92YnBwY3AifQ.40p53nLBipgbxUpfz5VKfw"
          {...viewport}
        >
          {match(isMapMovable)
            .with(true, () => (
              <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                <NavigationControl showCompass={true} />
              </div>
            ))
            .with(false, () => null)
            .exhaustive()}

          {/* Production */}
          {Boolean(fieldData?.fieldEnvelope) && (
            <Source
              id="field-boundary-layer"
              type="geojson"
              data={fieldData?.fieldEnvelope}
            >
              <Layer
                id="field-boundary"
                type="line"
                layout={{}}
                paint={{
                  'line-color': '#FF8F4C',
                  'line-width': 3,
                  'line-opacity': 0.8,
                  'line-dasharray': [2, 1],
                }}
              ></Layer>
            </Source>
          )}

          <Source id="heatmap-layer" type="geojson" data={post.geoJson}>
            <Layer
              id="heatmap"
              type="heatmap"
              layout={{
                visibility: showHeatmap ? 'visible' : 'none',
              }}
              paint={{
                'heatmap-radius': getHeatmapRadius(post),
                'heatmap-weight': 1,
                'heatmap-intensity': 1,
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0,
                  'rgba(33,102,172,0)',
                  0.2,
                  'rgb(103,169,207)',
                  0.4,
                  'rgb(209,229,240)',
                  0.6,
                  'rgb(253,219,199)',
                  0.8,
                  'rgb(239,138,98)',
                  1,
                  'rgb(178,24,43)',
                ],
                'heatmap-opacity': 0.8,
              }}
              // This key forces the layer to re-render when map loads
              key={`heatmap-${mapLoaded ? 'loaded' : 'loading'}`}
            />
          </Source>

          <ConditionalDisplay
            visible={showSprints && topSprintOnly && Boolean(post.sprints)}
          >
            {[core.fastestSprint(), core.fastestRun()]
              .filter((sprint) => Boolean(sprint))
              .slice(0, 1)
              .map((sprint, index) => {
                if (!sprint) {
                  return null
                }
                const numberOfCoordinates =
                  sprint.features[0].geometry.coordinates.length
                const start = getNthCoord(sprint, numberOfCoordinates - 2)
                const end = getNthCoord(sprint, numberOfCoordinates - 1)
                const bearingValue =
                  bearingToAzimuth(
                    bearing(
                      [start.longitude, start.latitude],
                      [end.longitude, end.latitude]
                    )
                  ) - (fieldData?.fieldBearing || 0)

                return (
                  <Source
                    key={`sprint-layer-${index}`}
                    id={`sprint-layer-${index}`}
                    type="geojson"
                    data={sprint}
                  >
                    <Layer
                      id={`sprint-${index}`}
                      type="line"
                      layout={{
                        visibility: 'visible',
                      }}
                      paint={{
                        'line-color': 'red',
                        'line-width': 4,
                        'line-opacity': 0.8,
                        'line-blur': 1,
                      }}
                    ></Layer>
                    <Marker latitude={end.latitude} longitude={end.longitude}>
                      <ArrowIcon
                        color="red"
                        bearingValue={bearingValue}
                      ></ArrowIcon>
                    </Marker>
                  </Source>
                )
              })}
          </ConditionalDisplay>

          <ConditionalDisplay
            visible={showSprints && !topSprintOnly && Boolean(post.sprints)}
          >
            {post.sprints?.map((sprint, index) => {
              const numberOfCoordinates =
                sprint.features[0].geometry.coordinates.length
              const start = getNthCoord(sprint, numberOfCoordinates - 2)
              const end = getNthCoord(sprint, numberOfCoordinates - 1)
              const bearingValue =
                bearingToAzimuth(
                  bearing(
                    [start.longitude, start.latitude],
                    [end.longitude, end.latitude]
                  )
                ) - (fieldData?.fieldBearing || 0)

              return (
                <Source
                  key={`sprint-layer-${index}`}
                  id={`sprint-layer-${index}`}
                  type="geojson"
                  data={sprint}
                >
                  <Layer
                    id={`sprint-${index}`}
                    type="line"
                    layout={{
                      visibility: 'visible',
                    }}
                    paint={{
                      'line-color': 'red',
                      'line-width': 4,
                      'line-opacity': 0.8,
                      'line-blur': 1,
                    }}
                  ></Layer>
                  <Marker latitude={end.latitude} longitude={end.longitude}>
                    <ArrowIcon
                      color="red"
                      bearingValue={bearingValue}
                    ></ArrowIcon>
                  </Marker>
                </Source>
              )
            })}
          </ConditionalDisplay>

          <ConditionalDisplay
            visible={showRuns && !topSprintOnly && Boolean(post.runs)}
          >
            {post.runs?.map((run, index) => {
              const numberOfCoordinates =
                run.features[0].geometry.coordinates.length
              const start = getNthCoord(run, numberOfCoordinates - 2)
              const end = getNthCoord(run, numberOfCoordinates - 1)
              const bearingValue =
                bearingToAzimuth(
                  bearing(
                    [start.longitude, start.latitude],
                    [end.longitude, end.latitude]
                  )
                ) - (fieldData?.fieldBearing || 0)
              return (
                <Source
                  key={`run-layer-${index}`}
                  id={`run-layer-${index}`}
                  type="geojson"
                  data={run}
                >
                  <Layer
                    id={`run-${index}`}
                    type="line"
                    layout={{
                      visibility: 'visible',
                    }}
                    paint={{
                      'line-color': '#FFD700',
                      'line-width': 4,
                      'line-opacity': 0.8,
                      'line-blur': 1,
                    }}
                  />
                  <Marker latitude={end.latitude} longitude={end.longitude}>
                    <ArrowIcon
                      color="yellow"
                      bearingValue={bearingValue}
                    ></ArrowIcon>
                  </Marker>
                </Source>
              )
            })}
          </ConditionalDisplay>
        </ReactMapGL>
      </div>
    </>
  )
}
