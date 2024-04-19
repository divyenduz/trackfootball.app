'use client'

import { LocationOnTwoTone } from '@mui/icons-material'
import { Typography } from '@mui/material'
import { FieldSpace } from '@trackfootball/sprint-detection'
import center from '@turf/center'
import envelope from '@turf/envelope'
import { FeatureCollection, LineString } from '@turf/helpers'
import { getCoord, getCoords } from '@turf/invariant'
import polygonToLineString from '@turf/polygon-to-linestring'
import Button from 'components/atoms/Button'
import { ConditionalDisplay } from 'components/atoms/ConditionalDisplay'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getBoundsForPoints } from 'packages/utils/map'
import { namedComponent } from 'packages/utils/utils'
import { useEffect, useState } from 'react'

import { getPostsWithoutFields } from './page'
import { Field, Post } from '.prisma/client'

const DataGrid = dynamic(() =>
  namedComponent(import('@mui/x-data-grid'), 'DataGrid')
)

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

interface Props {
  posts: Awaited<ReturnType<typeof getPostsWithoutFields>>
}

export default function AddField({ posts }: Props) {
  const [post, setPost] = useState<Post | null>(null)
  const [fieldName, setFieldName] = useState('TODO')
  const [bearing, setBearing] = useState(0)
  const [showHeatmap, setShowHeatmap] = useState(true)

  useEffect(() => {
    if (posts && posts?.length > 0) {
      setPost(posts[0])
    }
  }, [posts])

  const fallbackCoords = {
    latitude: 52.520008,
    longitude: 13.404954,
    zoom: 15,
  }
  const [viewport, setViewport] = useState(fallbackCoords)
  useEffect(() => {
    console.table(viewport)
  }, [viewport])

  type ActivePoint =
    | 'TOP_LEFT'
    | 'TOP_RIGHT'
    | 'BOTTOM_RIGHT'
    | 'BOTTOM_LEFT'
    | null
  type FieldCoords = Partial<Record<NonNullable<ActivePoint>, [number, number]>>
  const [fieldCoords, setFieldCoords] = useState<FieldCoords>({
    TOP_LEFT: [0, 0],
    TOP_RIGHT: [0, 0],
    BOTTOM_RIGHT: [0, 0],
    BOTTOM_LEFT: [0, 0],
  })

  useEffect(() => {
    async function effect() {
      if (!post) {
        return
      }

      const coordinates = (
        post.geoJson as unknown as FeatureCollection<LineString>
      )?.features[0].geometry.coordinates
      if (!Boolean(coordinates) || coordinates.length === 0) {
        return
      }

      //@ts-expect-error
      const bounds = await getBoundsForPoints(post)

      const newViewport = {
        width: '100%',
        height: 700,
        ...bounds,
      }
      setViewport(newViewport)

      const envelopeValue = polygonToLineString(
        envelope(post?.geoJson as unknown as FeatureCollection<LineString>)
      )
      const envelopeCoords = getCoords(envelopeValue)

      setFieldCoords({
        TOP_LEFT: envelopeCoords[3],
        TOP_RIGHT: envelopeCoords[2],
        BOTTOM_RIGHT: envelopeCoords[1],
        BOTTOM_LEFT: envelopeCoords[0],
      })
    }
    effect()
  }, [post])

  const field: Field = {
    id: 1,
    address: '',
    topLeft: fieldCoords['TOP_LEFT']!,
    topRight: fieldCoords['TOP_RIGHT']!,
    bottomRight: fieldCoords['BOTTOM_RIGHT']!,
    bottomLeft: fieldCoords['BOTTOM_LEFT']!,
    city: 'TODO',
    name: 'TODO',
    usage: 'FULL_FIELD',
    zoom: 15,
  }

  const fieldSpace = new FieldSpace(field)

  const fieldBearing = fieldSpace.fieldBearing()
  const fieldEnvelope = fieldSpace.fieldFeatureCollection()
  const fieldData = {
    fieldBearing,
    fieldEnvelope,
  }

  if (!post) {
    return <div>Loading...</div>
  }

  let longitude = fallbackCoords.longitude
  let latitude = fallbackCoords.latitude
  try {
    const centerValue = center(
      post.geoJson as unknown as FeatureCollection<LineString>
    )
    longitude = getCoord(centerValue!)[0]
    latitude = getCoord(centerValue!)[1]
  } catch (e) {
    console.error(e)
  }

  return (
    <>
      <Typography variant="h2">Posts without Fields</Typography>

      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight={true}
          hideFooter={false}
          rows={posts}
          pageSize={5}
          checkboxSelection={false}
          disableSelectionOnClick
          onRowClick={(params) => {}}
          columns={[
            {
              field: 'id',
              headerName: 'Post ID',
              width: 140,
              renderCell: (params) => {
                return (
                  <Link legacyBehavior href={``}>
                    <a
                      onClick={() => {
                        const post = posts.find(
                          (post) => params.row.id === post.id
                        )
                        setPost(post!)
                      }}
                    >
                      {params.row.id}
                    </a>
                  </Link>
                )
              },
            },
            {
              field: 'text',
              headerName: 'Title',
              width: 140,
              renderCell: (params) => {
                return (
                  <Link legacyBehavior href={``}>
                    <a
                      onClick={() => {
                        const post = posts.find(
                          (post) => params.row.id === post.id
                        )
                        setPost(post!)
                      }}
                    >
                      {params.row.text}
                    </a>
                  </Link>
                )
              },
            },
          ]}
        />
      </div>

      <div>Field name: </div>
      <div>
        <input
          style={{ border: '1px #ccc' }}
          onChange={(e) => {
            setFieldName(e.target.value)
          }}
        />
      </div>

      <div style={{ marginBottom: 30 }}></div>

      <div>Selected Post: {post.id}</div>

      <div style={{ marginBottom: 30 }}></div>

      <Link
        legacyBehavior
        href={`http://maps.google.com?q=${latitude},${longitude}&ll=${latitude},${longitude}&z=15`}
      >
        <a target="_blank">Open in Google maps</a>
      </Link>

      <span
        dangerouslySetInnerHTML={{
          __html: `
    INSERT INTO "public"."Field" ("name", "topLeft", "topRight", "bottomRight", "bottomLeft", "city", "usage", "address", "zoom") VALUES
    ('${fieldName}', '{${field.topLeft}}', '{${field.topRight}}', '{${field.bottomRight}}', '{${field.bottomLeft}}', 'Berlin', 'FULL_FIELD', NULL, ${viewport.zoom});
    `,
        }}
      ></span>

      <div style={{ marginBottom: 30 }}></div>

      <Button
        variant="contained"
        onClick={() => {
          setBearing(fieldBearing)
        }}
      >
        Set Bearing
      </Button>

      <Button
        variant="contained"
        onClick={() => {
          setShowHeatmap((showHeatmap) => !showHeatmap)
        }}
      >
        Toggle Heatmap
      </Button>

      <ReactMapGL
        bearing={bearing}
        {...viewport}
        onViewportChange={setViewport}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxApiAccessToken="pk.eyJ1IjoiZGl2eWVuZHV6IiwiYSI6ImNqeTRvc212NzEzdXczY2syam92YnBwY3AifQ.40p53nLBipgbxUpfz5VKfw"
      >
        <NavigationControl showCompass={true} />

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

            {Object.keys(fieldCoords)
              .filter((key: any) => {
                const coords = fieldCoords[key as NonNullable<ActivePoint>]
                return Boolean(coords)
              })
              .map((key: any, index) => {
                const [lng, lat] = fieldCoords[key as NonNullable<ActivePoint>]!
                return (
                  <Marker
                    draggable={true}
                    key={index}
                    latitude={lat}
                    longitude={lng}
                    onDragStart={() => {}}
                    onDrag={({ lngLat }) => {
                      const [lng, lat] = lngLat
                      setFieldCoords({
                        ...fieldCoords,
                        [key]: [lng, lat],
                      })
                    }}
                  >
                    <LocationOnTwoTone
                      style={{
                        fontSize: '30px',
                        cursor: 'pointer',
                        color: 'indianred',

                        position: 'relative',
                        left: -15,
                        top: -25,
                      }}
                    />
                  </Marker>
                )
              })}
          </Source>
        )}

        <ConditionalDisplay visible={showHeatmap}>
          <Source
            id="heatmap-layer"
            type="geojson"
            data={post.geoJson as unknown as FeatureCollection<LineString>}
          >
            <Layer
              id="heatmap"
              type="heatmap"
              layout={{
                visibility: 'visible',
              }}
              paint={{
                'heatmap-radius': 5,
              }}
            />
          </Source>
        </ConditionalDisplay>
      </ReactMapGL>

      <div style={{ marginBottom: 30 }}></div>
    </>
  )
}
