import * as tj from '@tmcw/togeojson'
import type {
  FeatureCollection,
  LineString,
  Position,
  GeoJsonProperties,
} from 'geojson'
import { DOMParser } from '@xmldom/xmldom'
import { match } from 'ts-pattern'

type DataType = 'StravaActivityStream' | 'gpx' | 'geoJson'

type ActivityStreamsKeys =
  | 'latlng'
  | 'time'
  | 'distance'
  | 'velocity_smooth'
  | 'heartrate'
  | 'cadence'

interface ActivityStreamsNode {
  data: number[] | number[][]
  series_type: ActivityStreamsKeys
  original_size: number
  resolution: 'high'
}

type ActivityStreams = {
  [key in ActivityStreamsKeys]?: ActivityStreamsNode
}

export class GeoData {
  private title: string
  private data: string
  private type: DataType
  private startTime: Date

  constructor(
    title: string,
    data: string,
    type: DataType,
    startTime: Date = new Date()
  ) {
    this.title = title
    this.data = data
    this.type = type
    this.startTime = startTime
  }

  private stravaActivityStreamToGeoJson() {
    const streams: ActivityStreams = JSON.parse(this.data)
    const startTime = this.startTime.toISOString()
    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: {
            title: this.title,
            type: '9',
            time: startTime,
            coordTimes: ((streams.time?.data as number[]) || []).map(
              (elapsedSeconds: number) => {
                const t = new Date(startTime)
                t.setSeconds(t.getSeconds() + elapsedSeconds)
                return t.toISOString()
              }
            ),
            heartRates: streams.heartrate?.data || [],
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: ((streams.latlng?.data as number[][]) || []).map(
              (coord: number[]) => coord.slice().reverse()
            ) as unknown as Position[],
          },
        },
      ],
    }
  }

  private gpxToGeoJson() {
    const gpx = new DOMParser().parseFromString(this.data, 'text/xml')
    const geoJson = tj.gpx(gpx)
    return geoJson
  }

  toGeoJson(): FeatureCollection<LineString, GeoJsonProperties> {
    const geoJson = match(this.type)
      .with('geoJson', () => JSON.parse(this.data))
      .with('StravaActivityStream', () => this.stravaActivityStreamToGeoJson())
      .with('gpx', () => this.gpxToGeoJson())
      .exhaustive()

    return geoJson
  }
}
