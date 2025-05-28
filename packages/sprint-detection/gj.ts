import type {
  FeatureCollection,
  LineString,
  Position,
} from 'geojson'
import {
  feature,
  featureCollection,
  geometry,
} from '@turf/helpers'

interface KVObject {
  [index: string]: number[] | string[]
}

interface BuildGeoJsonArgs {
  name: string
  time: string
  properties:
    | KVObject
    | {
        averageSpeed: number
      }
  coordinates: Position[]
}

export function buildGeoJson({
  name,
  time,
  properties,
  coordinates,
}: BuildGeoJsonArgs): FeatureCollection<LineString> {
  const geometryValue = geometry('LineString', coordinates)
  const featureValue = feature(geometryValue, {
    name,
    time,
    ...properties,
  })
  const featureCollectionValue = featureCollection([featureValue])
  return featureCollectionValue as FeatureCollection<LineString>
}
