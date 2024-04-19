'use client'

import { LocationOnTwoTone } from '@mui/icons-material'
import { Typography } from '@mui/material'
import { FieldSpace } from '@trackfootball/sprint-detection'
import center from '@turf/center'
import { getCoord } from '@turf/invariant'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getBoundsForPoints } from 'packages/utils/map'
import { namedComponent } from 'packages/utils/utils'
import React, { useEffect, useState } from 'react'
import { match } from 'ts-pattern'

import { getFields } from './page'
import { Field } from '.prisma/client'

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
  fields: Awaited<ReturnType<typeof getFields>>
}

export default async function EditField({ fields }: Props) {
  const [immutableField, setImmutableField] = useState<Field | null>(null)
  const [field, setField] = useState<Field | null>(null)

  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11')

  useEffect(() => {
    if (fields && fields?.length > 0) {
      setImmutableField(fields[0])
      setField(fields[0])
    }
  }, [fields])

  const fallbackCoords = {
    latitude: 52.520008,
    longitude: 13.404954,
    zoom: 15,
  }
  const [viewport, setViewport] = useState(fallbackCoords)

  type ActivePoint =
    | 'topLeft'
    | 'topRight'
    | 'bottomRight'
    | 'bottomLeft'
    | null

  useEffect(() => {
    async function effect() {
      if (!field) {
        return
      }

      if (!immutableField) {
        return
      }

      const fieldSpace = new FieldSpace(immutableField!)

      const bounds = await getBoundsForPoints({
        //@ts-expect-error
        geoJson: fieldSpace.fieldFeatureCollection(),
        fieldId: immutableField.id,
        Field: immutableField,
      })

      const newViewport = {
        width: '100%',
        height: 700,
        ...bounds,
        zoom: field.zoom || 15,
      }
      setViewport(newViewport)
    }
    effect()
  }, [field])

  if (!field) {
    return <>Loading...</>
  }

  const fieldSpace = new FieldSpace(field!)

  const fieldBearing = fieldSpace.fieldBearing()
  const fieldEnvelope = fieldSpace.fieldFeatureCollection()
  const fieldData = {
    fieldBearing,
    fieldEnvelope,
  }

  const centerValue = center(fieldSpace.fieldFeatureCollection())
  const longitude = getCoord(centerValue!)[0]
  const latitude = getCoord(centerValue!)[1]

  return (
    <>
      <Typography variant="h2">Fields</Typography>

      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight={true}
          hideFooter={false}
          rows={fields}
          pageSize={5}
          checkboxSelection={false}
          disableSelectionOnClick
          onRowClick={(params) => {}}
          columns={[
            {
              field: 'id',
              headerName: 'Field ID',
              width: 140,
              renderCell: (params) => {
                return (
                  <Link legacyBehavior href={``}>
                    <a
                      onClick={() => {
                        const field = fields.find(
                          (field) => params.row.id === field.id
                        )
                        setField(field!)
                        setImmutableField(field!)
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
              headerName: 'Name',
              width: 140,
              renderCell: (params) => {
                return (
                  <Link legacyBehavior href={``}>
                    <a
                      onClick={() => {
                        const field = fields.find(
                          (field) => params.row.id === field.id
                        )
                        setField(field!)
                        setImmutableField(field!)
                      }}
                    >
                      {params.row.name}
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
          style={{ border: '1px solid #ccc' }}
          value={field.name}
          onChange={(e) => {
            //@ts-expect-error
            setField((field) => {
              return {
                ...field,
                name: e.target.value,
              }
            })
          }}
        />

        <div>Field city: </div>
        <input
          style={{ border: '1px solid #ccc' }}
          value={field?.city || ''}
          onChange={(e) => {
            //@ts-expect-error
            setField((field) => {
              return {
                ...field,
                city: e.target.value,
              }
            })
          }}
        />

        <div>Field usage: </div>
        <input
          style={{ border: '1px solid #ccc' }}
          value={field?.usage}
          onChange={(e) => {
            //@ts-expect-error
            setField((field) => {
              return {
                ...field,
                usage: e.target.value,
              }
            })
          }}
        />

        <div>Field zoom: </div>
        <input
          style={{ border: '1px solid #ccc' }}
          value={field.zoom}
          onChange={(e) => {
            //@ts-expect-error
            setField((field) => {
              return {
                ...field,
                zoom: e.target.value,
              }
            })
          }}
        />
      </div>

      <div style={{ marginBottom: 30 }}></div>

      <div>Selected Field: {field.id}</div>

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
    Update "public"."Field" SET
    "name" = '${field.name}',
    "topLeft" = '{${field.topLeft}}',
    "topRight" = '{${field.topRight}}',
    "bottomRight" = '{${field.bottomRight}}',
    "bottomLeft" = '{${field.bottomLeft}}',
    "city" = '${field.city}',
    "usage" = '${field.usage}',
    "address" = NULL,
    "zoom" = ${field.zoom}
    WHERE "id" = ${field.id};
    `,
        }}
      ></span>

      <div style={{ marginBottom: 30 }}></div>

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

      <ReactMapGL
        {...viewport}
        mapStyle={mapStyle}
        bearing={fieldBearing}
        onViewportChange={setViewport}
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

            {Object.keys(field)
              .filter((key: any) => {
                return [
                  'topLeft',
                  'topRight',
                  'bottomRight',
                  'bottomLeft',
                ].includes(key)
              })
              .filter((key: any) => {
                const coords = field[key as NonNullable<ActivePoint>]
                return Boolean(coords)
              })
              .map((key: any, index) => {
                const [lng, lat] = field[key as NonNullable<ActivePoint>]!
                return (
                  <Marker
                    draggable={true}
                    key={index}
                    latitude={lat}
                    longitude={lng}
                    onDragStart={() => {}}
                    onDrag={({ lngLat }) => {
                      const [lng, lat] = lngLat
                      //@ts-expect-error
                      setField((field) => {
                        return {
                          ...field,
                          [key as NonNullable<ActivePoint>]: [lng, lat],
                        }
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
      </ReactMapGL>

      <div style={{ marginBottom: 30 }}></div>
    </>
  )
}
