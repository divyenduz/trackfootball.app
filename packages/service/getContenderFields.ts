import { Field, repository } from '@trackfootball/database'
import area from '@turf/area'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import center from '@turf/center'
import envelope from '@turf/envelope'
import type { FeatureCollection, LineString } from 'geojson'
import { featureCollection, point } from '@turf/helpers'
import intersect from '@turf/intersect'
import { match } from 'ts-pattern'

interface GetContenderFieldsArgs {
  postId: number
}

export interface FieldContender {
  field: Field
  percentageAreaCovered: number
}

export async function getContenderFields({
  postId,
}: GetContenderFieldsArgs): Promise<FieldContender[]> {
  const post = await repository.getPostById(postId)

  if (!post) {
    throw new Error(`Post ${postId} not found`)
  }

  const geoJson = post.geoJson as unknown as FeatureCollection<LineString>
  const centerValue = center(geoJson)
  const geoJsonCover = envelope(geoJson)

  const fullFields: Field[] = await repository.getFieldsByUsage('FULL_FIELD')

  const matchingFullField = fullFields.find((field) => {
    const fieldFeatures = featureCollection([
      point(field.topLeft, { name: 'topLeft' }),
      point(field.topRight, { name: 'topRight' }),
      point(field.bottomRight, { name: 'bottomRight' }),
      point(field.bottomLeft, { name: 'bottomLeft' }),
    ])
    const fieldCover = envelope(fieldFeatures)
    return booleanPointInPolygon(centerValue, fieldCover)
  })

  if (!matchingFullField) {
    return []
  }

  const fields: Field[] = await repository.getFieldsByName(
    matchingFullField.name,
  )

  const fieldsWithIntersectionArea = fields.map((field) => {
    const fieldFeatures = featureCollection([
      point(field.topLeft, { name: 'topLeft' }),
      point(field.topRight, { name: 'topRight' }),
      point(field.bottomRight, { name: 'bottomRight' }),
      point(field.bottomLeft, { name: 'bottomLeft' }),
    ])
    const fieldCover = envelope(fieldFeatures)
    const totalFieldArea = area(fieldCover)

    const intersection = intersect(
      featureCollection([geoJsonCover, fieldCover]),
    )
    const intersectionArea = match(Boolean(intersection))
      .with(true, () => area(intersection!))
      .with(false, () => 0)
      .exhaustive()

    const percentageAreaCovered = Math.round(
      (intersectionArea / totalFieldArea) * 100,
    )

    return {
      field: field,
      percentageAreaCovered,
    }
  })

  console.log(fieldsWithIntersectionArea.map((field) => field.field.name))

  return fieldsWithIntersectionArea.sort(
    (a, b) => b.percentageAreaCovered - a.percentageAreaCovered,
  )
}
