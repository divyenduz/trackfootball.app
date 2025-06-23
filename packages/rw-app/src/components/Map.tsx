import type { Field, Post } from '@trackfootball/kanel'
import { FieldSpace } from '@trackfootball/sprint-detection'
import bearing from '@turf/bearing'
import { bearingToAzimuth } from '@turf/helpers'
import React, { lazy, useEffect, useRef, useState } from 'react'
import type { ViewState } from 'react-map-gl/mapbox'
import { match } from 'ts-pattern'

import invariant from 'tiny-invariant'
import { getNthCoord } from '@/utils'
import { ConditionalDisplay } from './atoms/ConditionalDisplay'

const ReactMapGL = lazy(() => import('react-map-gl/mapbox'))

const Layer = lazy(() =>
  import('react-map-gl/mapbox').then(({ Layer }) => ({ default: Layer }))
)
const Marker = lazy(() =>
  import('react-map-gl/mapbox').then(({ Marker }) => ({ default: Marker }))
)
const NavigationControl = lazy(() =>
  import('react-map-gl/mapbox').then(({ NavigationControl }) => ({
    default: NavigationControl,
  }))
)
const Source = lazy(() =>
  import('react-map-gl/mapbox').then(({ Source }) => ({ default: Source }))
)

type ViewPort = ViewState & {
  width?: number
  height?: number
}

interface MapProps {
  isMapMovable: boolean
  viewport: ViewPort
  mapStyle: string
  setViewport: React.Dispatch<React.SetStateAction<ViewPort>>
  showSprints: boolean
  showRuns: boolean
  showHeatmap: boolean
  post: Post & {
    Field: Field
  }
  page: 'activity' | 'feed'
}

interface ArrowIconProps {
  color: 'red' | 'yellow'
  bearingValue: number
}

const ArrowIcon: React.FC<ArrowIconProps> = ({ color, bearingValue }) => {
  return (
    <span
      style={{
        color,
        fontSize: '30px',
        transform: 'rotate(' + bearingValue + 'deg)',
      }}
    >
      ^
    </span>
  )
}

export const Map: React.FC<MapProps> = ({
  isMapMovable,
  viewport,
  setViewport,
  showSprints,
  showRuns,
  showHeatmap,
  post,
  page,
}) => {
  const [mapStyle] = useState('mapbox://styles/mapbox/outdoors-v12')
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)

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

  const taggedSprints =
    post.sprints?.map((sprint) => {
      return {
        tag: 'sprint',
        ...sprint,
      }
    }) || []

  const taggedRuns = post.runs?.map((sprint) => {
    return {
      tag: 'run',
      ...sprint,
    }
  })
  const taggedPowerRuns = taggedSprints.concat(taggedRuns) || []

  if (!post.geoJson) {
    return <>Post is still processing...</>
  }

  return (
    <ReactMapGL
      {...viewport}
      ref={mapRef}
      scrollZoom={false}
      touchZoomRotate={false}
      doubleClickZoom={isMapMovable}
      dragPan={isMapMovable}
      bearing={fieldData?.fieldBearing || 0}
      onMove={(evt: any) => setViewport(evt.viewState)}
      onLoad={() => {
        console.log('Map loaded')
        setMapLoaded(true)
      }}
      mapStyle={mapStyle}
      style={{ height: '100%', width: '100%', touchAction: 'pan-y' }}
      mapboxAccessToken="pk.eyJ1IjoiZGl2eWVuZHV6IiwiYSI6ImNqeTRvc212NzEzdXczY2syam92YnBwY3AifQ.40p53nLBipgbxUpfz5VKfw"
    >
      {match(isMapMovable)
        .with(true, () => <NavigationControl showCompass={false} />)
        .with(false, () => null)
        .exhaustive()}

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
              'line-opacity': 1,
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
            'heatmap-radius': 5,
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

      <ConditionalDisplay visible={showSprints && Boolean(taggedPowerRuns)}>
        {taggedPowerRuns.map((powerRun, index) => {
          const feature = powerRun.features[0]
          invariant(feature, `expected feature to exist`)
          const numberOfCoordinates = feature.geometry.coordinates.length
          const start = getNthCoord(powerRun, numberOfCoordinates - 2)
          const end = getNthCoord(powerRun, numberOfCoordinates - 1)
          const bearingValue =
            bearingToAzimuth(
              bearing(
                [start.longitude, start.latitude],
                [end.longitude, end.latitude]
              )
            ) - (fieldData?.fieldBearing || 0)

          const lineColor = powerRun.tag === 'sprint' ? 'red' : 'yellow'

          return (
            <Source
              key={`sprint-layer-${index}`}
              id={`sprint-layer-${index}`}
              type="geojson"
              data={powerRun}
            >
              <Layer
                id={`sprint-${index}`}
                type="line"
                layout={{
                  visibility: 'visible',
                }}
                paint={{
                  'line-color': lineColor,
                  'line-width': 3,
                  'line-opacity': 1,
                  'line-blur': 0,
                }}
              ></Layer>
              <Marker
                className="absolute"
                latitude={end.latitude}
                longitude={end.longitude}
              >
                <ArrowIcon
                  color={lineColor}
                  bearingValue={bearingValue}
                ></ArrowIcon>
              </Marker>
            </Source>
          )
        })}
      </ConditionalDisplay>
    </ReactMapGL>
  )
}
