import { WebMercatorViewport } from '@math.gl/web-mercator'
import type { Field, Post } from '@prisma/client'
import type { FeatureCollection, LineString } from 'geojson'
import invariant from 'tiny-invariant'
import { match } from 'ts-pattern'

export function getNthCoord(geoJson: FeatureCollection<LineString>, n: number) {
  const feature = geoJson.features[0]
  invariant(feature, `expected feature to exist`)
  const coords = feature.geometry.coordinates
  if (n >= coords.length) {
    invariant(
      false,
      `getNthCoord called with n (${n}) > coords.length (${coords.length})`,
    )
  }
  const nthCoord = coords[n]
  invariant(nthCoord, `expected nthCoord to exist`)
  const [longitude, latitude] = nthCoord
  invariant(longitude, `expected longitude to exist`)
  invariant(latitude, `expected longitude to exist`)
  return {
    latitude,
    longitude,
  }
}

type PostWithField = Post & {
  Field: Field
}

export const getBoundsForPoints = (post: PostWithField) => {
  //@ts-expect-error
  const coordinates = post.geoJson?.features[0].geometry.coordinates

  const fallbackCoords = {
    latitude: 52.520008,
    longitude: 13.404954,
    zoom: 15,
  }

  // Note: case when an activity is uploaded without GPS data
  if (!Boolean(coordinates)) {
    return fallbackCoords
  }

  function getWindowWidth() {
    if (typeof window === 'undefined') {
      return 800
    }
    return window.innerWidth
  }

  const findMinMax = (
    boundPoint: { min: number; max: number },
    point: number,
  ) => {
    return {
      min: point <= boundPoint.min ? point : boundPoint.min,
      max: point >= boundPoint.max ? point : boundPoint.max,
    }
  }

  const defaultMinMax = {
    min: Number.MAX_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER * -1,
  }

  // Calculate corner values of bounds
  const pointsLong = coordinates
    .map((coord: [number, number]) => coord[0])
    .reduce(findMinMax, defaultMinMax)
  const pointsLat = coordinates
    .map((coord: [number, number]) => coord[1])
    .reduce(findMinMax, defaultMinMax)

  const cornersLongLat = match(Boolean(post.fieldId && post.Field))
    .with(true, () => [
      [post.Field.topLeft[0], post.Field.topLeft[1]],
      [post.Field.bottomRight[0], post.Field.bottomRight[1]],
    ])
    .with(false, () => [
      [pointsLong.min, pointsLat.min],
      [pointsLong.max, pointsLat.max],
    ])
    .exhaustive()

  try {
    // Use WebMercatorViewport to get center longitude/latitude and zoom
    const viewport = new WebMercatorViewport({
      width: getWindowWidth(),
      height: 600,
    }).fitBounds(cornersLongLat as any, {
      padding: 30,
    })

    const { longitude, latitude, zoom } = viewport
    return { longitude, latitude, zoom: post.Field?.zoom || zoom }
  } catch (e) {
    console.error(e)
    return fallbackCoords
  }
}
