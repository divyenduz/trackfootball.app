import { kmphToMps } from '@trackfootball/utils'
import { addDurations, durationToSeconds } from '@trackfootball/utils'
import distance from '@turf/distance'
import { FeatureCollection, LineString } from '@turf/helpers'
import length from '@turf/length'
import {
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  intervalToDuration,
} from 'date-fns'

import { buildGeoJson } from './gj'

type CustomPropertyTypes = 'speeds' | 'averageSpeed'
type GivenPropertyTypes = 'heartRates' | 'coordTimes'
type PropertyTypes = GivenPropertyTypes | CustomPropertyTypes

interface PluckSegmentsArgs {
  minSpeed: number
  maxSpeed: number
  minSegmentDuration: number
  type: 'MOVEMENT' | 'JOG' | 'RUN' | 'SPRINT'
}

export class Core {
  geoJson: FeatureCollection<LineString>

  // Cache
  private cachedSprints: Array<FeatureCollection<LineString>> | null = null
  private cachedRuns: Array<FeatureCollection<LineString>> | null = null
  private cachedMovements: Array<FeatureCollection<LineString>> | null = null

  constructor(data: FeatureCollection<LineString>) {
    this.geoJson = data

    const coordinates = this.getCoordinates()
    const coordTimes = this.getProperty('coordTimes')

    let cumulativeDistances: number[] = []
    let cumulativeDistance: number = 0
    let cumulativeTimes: number[] = [1]
    let cumulativeTime: number = 1
    let speeds: number[] = []

    if (Boolean(coordTimes) && coordTimes.length > 0) {
      if (speeds.length === 0) {
        speeds = coordinates.reduce((speeds, coordinate, index) => {
          if (index === 0 || index === coordinates.length - 1) {
            return speeds.concat(0)
          }
          const nextCoordinate = coordinates[index + 1]
          const distanceValue = distance(nextCoordinate, coordinate, {
            units: 'meters',
          })
          // Note: cumulating last n distances/times, based on https://gis.stackexchange.com/questions/7319/calculate-maximum-speed-from-gps-data
          cumulativeDistances = cumulativeDistances
            .concat(distanceValue)
            .slice(Math.max(cumulativeDistances.length - 10, 0)) //?
          cumulativeDistance = cumulativeDistances.reduce((a, b) => a + b) //?

          const nextTime = new Date(coordTimes[index + 1]).getTime() / 1000
          const currentTime = new Date(coordTimes[index]).getTime() / 1000
          const time = nextTime - currentTime
          cumulativeTimes = cumulativeTimes
            .concat(time)
            .slice(Math.max(cumulativeDistances.length - 10, 0)) //?
          cumulativeTime = cumulativeTimes.reduce((a, b) => a + b) || 1 //?

          const speed = cumulativeDistance / cumulativeTime //?

          if (speed >= 12) {
            return speeds.concat(12) // Cap speed to 45km/hr
          }
          return speeds.concat(speed)
        }, [])
      }
    }

    this.setProperty('speeds', speeds)
  }

  sprints(): Array<FeatureCollection<LineString>> {
    if (Boolean(this.cachedSprints)) {
      return this.cachedSprints!
    }
    const MIN_SPEED_THRESHOLD = parseFloat(kmphToMps(10))
    const MAX_SPEED_THRESHOLD = parseFloat(kmphToMps(45))
    const MIN_SEGMENT_DURATION = 5
    const sprints = this.pluckSegments({
      minSpeed: MIN_SPEED_THRESHOLD,
      maxSpeed: MAX_SPEED_THRESHOLD,
      minSegmentDuration: MIN_SEGMENT_DURATION,
      type: 'SPRINT',
    })
    this.cachedSprints = sprints
    return sprints
  }

  fastestSprint(): FeatureCollection<LineString> | null {
    const sprints = this.sprints()
    if (sprints.length === 0) {
      return null
    }
    const speeds = sprints.map((sprint) => {
      const core = new Core(sprint)
      return core.averageSpeed()
    })
    const index = speeds.indexOf(Math.max(...speeds))
    return sprints[index]
  }

  fastestSprintDistance(): number {
    const fastestSprint = this.fastestSprint()
    if (!Boolean(fastestSprint)) {
      return 0
    }
    const core = new Core(fastestSprint!)
    return core.totalDistance()
  }

  fastestSprintSpeed(): number {
    const fastestSprint = this.fastestSprint()
    if (!Boolean(fastestSprint)) {
      return 0
    }
    const core = new Core(fastestSprint!)
    return core.maxSpeed()
  }

  longestSprint(): FeatureCollection<LineString> | null {
    const sprints = this.sprints()
    if (sprints.length === 0) {
      return null
    }
    const distances = sprints.map((sprint) => {
      const core = new Core(sprint)
      return core.totalDistance()
    })
    const index = distances.indexOf(Math.max(...distances))
    return sprints[index]
  }

  longestSprintDistance(): number {
    const longestSprint = this.longestSprint()
    if (!Boolean(longestSprint)) {
      return 0
    }
    const core = new Core(longestSprint!)
    return core.totalDistance()
  }

  longestSprintSpeed(): number {
    const longestSprint = this.longestSprint()
    if (!Boolean(longestSprint)) {
      return 0
    }
    const core = new Core(longestSprint!)
    return core.maxSpeed()
  }

  totalSprintTime(): Duration {
    const sprints = this.sprints()
    const duration = this.totalTime(sprints)
    return duration
  }

  runs(): Array<FeatureCollection<LineString>> {
    if (Boolean(this.cachedRuns)) {
      return this.cachedRuns!
    }
    const MIN_SPEED_THRESHOLD = parseFloat(kmphToMps(7))
    const MAX_SPEED_THRESHOLD = parseFloat(kmphToMps(10))
    const MIN_SEGMENT_DURATION = 7
    const runs = this.pluckSegments({
      minSpeed: MIN_SPEED_THRESHOLD,
      maxSpeed: MAX_SPEED_THRESHOLD,
      minSegmentDuration: MIN_SEGMENT_DURATION,
      type: 'RUN',
    })
    this.cachedRuns = runs
    return runs
  }

  fastestRun(): FeatureCollection<LineString> | null {
    const runs = this.runs()
    if (runs.length === 0) {
      return null
    }
    const speeds = runs.map((run) => {
      const core = new Core(run)
      return core.averageSpeed()
    })
    const index = speeds.indexOf(Math.max(...speeds))
    return runs[index]
  }

  fastestRunDistance(): number {
    const fastestRun = this.fastestRun()
    if (!Boolean(fastestRun)) {
      return 0
    }
    const core = new Core(fastestRun!)
    return core.totalDistance()
  }

  totalDistance(): number {
    const distance = length(this.geoJson, {
      units: 'meters',
    }).toFixed(2)
    const totalDistance = Number.parseFloat(distance)
    if (Number.isNaN(totalDistance)) {
      return 0.0
    }
    return totalDistance
  }

  maxSpeed(): number {
    const sprints = this.sprints()
    if (sprints.length > 0) {
      return this.fastestSprintSpeed()
    }

    const averageSpeed = this.getProperty('averageSpeed')
    if (averageSpeed) {
      return parseFloat(averageSpeed)
    }

    const speeds = this.getProperty('speeds')
    if (speeds.length === 0) {
      return 0
    }
    const speed = Math.max(...speeds).toFixed(2)
    return parseFloat(speed)
  }

  private calculateAverage(values: number[]): number {
    const nonZeroValues = values.filter((value) => value > 0)
    if (nonZeroValues.length === 0) {
      return 0
    }
    const totalValue = values.reduce((sum, value) => sum + value, 0)
    const average = (totalValue / nonZeroValues.length).toFixed(2)
    return parseFloat(average)
  }

  averageSpeed(): number {
    const averageSpeed = this.getProperty('averageSpeed')
    if (averageSpeed) {
      return parseFloat(averageSpeed)
    }

    const speeds: number[] = this.getProperty('speeds')
    return this.calculateAverage(speeds)
  }

  getStartTime() {
    const coordTimes = this.getProperty('coordTimes')
    const firstTime = new Date(coordTimes[0] || 0)
    return firstTime
  }

  elapsedTime(): Duration {
    const startTime = this.getStartTime()

    const coordTimes = this.getProperty('coordTimes')
    const endTime = new Date(coordTimes[coordTimes.length - 1] || 0)

    const eth = differenceInHours(endTime, startTime)
    const etm = differenceInMinutes(endTime, startTime) - eth * 60
    const ets =
      differenceInSeconds(endTime, startTime) - eth * 60 * 60 - etm * 60
    return {
      hours: eth,
      minutes: etm,
      seconds: ets,
    } as Duration
  }

  private pluckSegments({
    minSpeed,
    maxSpeed,
    minSegmentDuration,
    type,
  }: PluckSegmentsArgs) {
    const speeds: number[] = this.getProperty('speeds')
    let segmentSlices: [number, number][] = []

    const coordTimes = this.getProperty('coordTimes')

    let startSlice = 0
    for (let i = 0; i < speeds.length; i++) {
      const speed = speeds[i]
      const nextSpeed = i + 1 < speeds.length ? speeds[i + 1] : 0

      // Note: Start a new slice if current speed is < mimumum speed (for say, run) and next speed is greater than or equal to the threshold
      if (speed < minSpeed && nextSpeed >= minSpeed) {
        startSlice = i + 1
      }

      // Note: if next speed is within the min/max range both inclusive, then continue conting this as the same segment
      if (nextSpeed >= minSpeed && nextSpeed <= maxSpeed) {
        continue
      }

      const segmentStartTime = new Date(coordTimes[startSlice])
      const segmentEndTime = new Date(coordTimes[i + 1])

      const eth = differenceInHours(segmentEndTime, segmentStartTime)
      const etm =
        differenceInMinutes(segmentEndTime, segmentStartTime) - eth * 60
      const ets =
        differenceInSeconds(segmentEndTime, segmentStartTime) -
        eth * 60 * 60 -
        etm * 60
      const duration = {
        hours: eth,
        minutes: etm,
        seconds: ets,
      }
      const segmentDuration = durationToSeconds(duration)

      const segmentSize = i + 1 - startSlice

      // Note: It is a segment only if it happens for >= n seconds and has 2 or more coordinates. Control reaches here only when nextSpeed is out of range and "continue" is not run
      if (segmentSize >= 2 && segmentDuration >= minSegmentDuration) {
        segmentSlices = segmentSlices.concat([[startSlice, i + 1]])
      }

      // Note: start a new slice
      startSlice = i + 1
    }

    const segments = segmentSlices
      .map((segmentSlice, index) => {
        const coordTimes = this.getProperty('coordTimes').slice(
          segmentSlice[0],
          segmentSlice[1]
        )
        const heartRates = this.getProperty('heartRates').slice(
          segmentSlice[0],
          segmentSlice[1]
        )
        const speeds = this.getProperty('speeds').slice(
          segmentSlice[0],
          segmentSlice[1]
        )
        const coordinates = this.getCoordinates().slice(
          segmentSlice[0],
          segmentSlice[1]
        )

        const averageSpeed = this.calculateAverage(speeds)

        const geoJson = buildGeoJson({
          name: `${type} ${index}`,
          time: coordTimes[0],
          properties: {
            coordTimes: [coordTimes[0], coordTimes[coordTimes.length - 1]],
            heartRates: [heartRates[0], heartRates[heartRates.length - 1]],
            averageSpeed,
          },
          coordinates: [coordinates[0], coordinates[coordinates.length - 1]],
        })
        const core = new Core(geoJson)

        // Only distances >x meters are counted as sprints and runs
        if (['RUN', 'SPRINT'].includes(type)) {
          if (core.totalDistance() >= 5) {
            return geoJson
          } else {
            return false
          }
        } else {
          return geoJson
        }
      })
      .filter((segment): segment is ReturnType<typeof buildGeoJson> =>
        Boolean(segment)
      )

    return segments
  }

  getProperty(property: PropertyTypes) {
    // This condition is required because when a gpx is downloaded from strava and converted to geoJson, the location of
    // meta properties is different. This is okay for now because meta properties can be any key value pairs.
    if (property === 'coordTimes') {
      return (
        this.geoJson?.features[0]?.properties?.[property] ||
        this.geoJson?.features[0]?.properties?.['coordinateProperties']?.[
          'times'
        ] ||
        []
      )
    }
    // This condition is required because when a gpx is downloaded from strava and converted to geoJson, the location of
    // meta properties is different. This is okay for now because meta properties can be any key value pairs.
    if (property === 'heartRates') {
      return (
        this.geoJson?.features[0]?.properties?.[property] ||
        this.geoJson?.features[0]?.properties?.['coordinateProperties']?.[
          'heartRates'
        ] ||
        []
      )
    }

    if (property === 'averageSpeed') {
      return this.geoJson?.features[0]?.properties?.[property] || 0
    } else {
      return this.geoJson?.features[0]?.properties?.[property] || []
    }
  }

  setProperty(property: PropertyTypes, value: number[]) {
    return (this.geoJson.features[0]!.properties![property] = value)
  }

  getCoordinates() {
    return this.geoJson?.features[0]?.geometry.coordinates
  }

  // Total time of movements
  private totalTime(geoJsons: Array<FeatureCollection<LineString>>): Duration {
    const movementTimes = geoJsons.map((movement) => {
      const core = new Core(movement)
      const time = core.elapsedTime()
      return time
    })
    const movingTime = movementTimes.reduce(
      (acc, movementTime) => {
        return addDurations(acc, movementTime)
      },
      {
        hours: 0,
        minutes: 0,
        seconds: 0,
      }
    )
    const movingTimeInSeconds = durationToSeconds(movingTime)
    const duration = intervalToDuration({
      start: 0,
      end: movingTimeInSeconds * 1000,
    })
    return duration
  }
}
