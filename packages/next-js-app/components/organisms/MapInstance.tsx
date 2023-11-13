import { ArrowUpward } from '@mui/icons-material'
import { Core } from '@trackfootball/sprint-detection'
import { FieldSpace } from '@trackfootball/sprint-detection'
import bearing from '@turf/bearing'
import { bearingToAzimuth } from '@turf/helpers'
import dynamic from 'next/dynamic'
import React, { useState } from 'react'
import type { ViewState } from 'react-map-gl'
import { match } from 'ts-pattern'

import { getNthCoord } from '../../packages/utils/map'
import { namedComponent } from '../../packages/utils/utils'
import { ConditionalDisplay } from '../atoms/ConditionalDisplay'
import { FeedItemFeedPost } from './Feed/FeedItem'

const ReactMapGL = dynamic(() => import('react-map-gl'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
})

const Layer = dynamic(() => namedComponent(import('react-map-gl'), 'Layer'))
const Marker = dynamic(() => namedComponent(import('react-map-gl'), 'Marker'))
const NavigationControl = dynamic(() =>
  namedComponent(import('react-map-gl'), 'NavigationControl')
)
const Source = dynamic(() => namedComponent(import('react-map-gl'), 'Source'))

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
  post: FeedItemFeedPost
  page: 'activity' | 'feed'
}

interface ArrowIconProps {
  color: 'red' | 'yellow'
  bearingValue: number
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

  const core = new Core(post.geoJson!)

  return (
    <>
      {match(page)
        .with('activity', () => (
          <a
            onClick={() => {
              if (mapStyle === 'mapbox://styles/mapbox/satellite-v9') {
                setMapStyle('mapbox://styles/mapbox/streets-v11')
              } else {
                setMapStyle('mapbox://styles/mapbox/satellite-v9')
              }
            }}
          >
            {match(mapStyle)
              .with('mapbox://styles/mapbox/satellite-v9', () => (
                <div className="flex flex-row flex-wrap items-center justify-start gap-2 my-2">
                  🗺️ Use street map
                </div>
              ))
              .otherwise(() => (
                <div className="flex flex-row flex-wrap items-center justify-start gap-2 my-2">
                  🛰️ Use satellite map
                </div>
              ))}
          </a>
        ))
        .otherwise(() => null)}

      {Boolean(field && page === 'activity') && (
        <div>
          <div>
            {field?.name} ({field?.usage})
          </div>
        </div>
      )}

      <ReactMapGL
        className="map-instance"
        scrollZoom={false}
        touchZoom={false}
        doubleClickZoom={isMapMovable}
        dragPan={isMapMovable}
        bearing={fieldData?.fieldBearing || 0}
        onViewportChange={(viewport: any) => setViewport(viewport)}
        touchAction={'pan-y'}
        mapStyle={mapStyle}
        mapboxApiAccessToken="pk.eyJ1IjoiZGl2eWVuZHV6IiwiYSI6ImNqeTRvc212NzEzdXczY2syam92YnBwY3AifQ.40p53nLBipgbxUpfz5VKfw"
        {...viewport}
      >
        {match(isMapMovable)
          .with(true, () => <NavigationControl showCompass={false} />)
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
              'heatmap-radius': match(Boolean(post.numberOfCoordinates))
                .with(true, () => {
                  const heatmapRadius = 25000 / post.numberOfCoordinates
                  if (heatmapRadius < 3) {
                    return 3
                  }
                  if (heatmapRadius > 10) {
                    return 10
                  }
                  return heatmapRadius
                })
                .with(false, () => 5)
                .exhaustive(),
            }}
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
                      'line-width': 3,
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
                    'line-width': 3,
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
                    'line-color': 'yellow',
                    'line-width': 3,
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
    </>
  )
}
