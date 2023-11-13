import { Field, Post } from '@prisma/client'
import { sql } from '@trackfootball/database'
import area from '@turf/area'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import center from '@turf/center'
import envelope from '@turf/envelope'
import {
  FeatureCollection,
  LineString,
  featureCollection,
  point,
} from '@turf/helpers'
import intersect from '@turf/intersect'
import { match } from 'ts-pattern'

interface PostAddFieldArgs {
  postId: number
}

export async function postAddField({ postId }: PostAddFieldArgs) {
  {
    const post = (
      await sql<Post[]>`
        SELECT * FROM "Post"
        WHERE "id" = ${postId}
        `
    )[0]

    if (!post) {
      console.error(`post.tagging.addField: Post ${postId} not found`)
      return
    }

    const geoJson = post.geoJson as unknown as FeatureCollection<LineString>
    const centerValue = center(geoJson)
    const geoJsonCover = envelope(geoJson)

    const fullFields = (await sql<
      Field[]
    >`SELECT * FROM "Field" WHERE usage='FULL_FIELD'`) as Field[]
    // Note: get the matching full field
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

    if (!Boolean(matchingFullField)) {
      console.error(
        `info: post ${post.id} unable to find a matching full field`
      )
      return
    }

    const fields = (await sql<Field[]>`SELECT * FROM "Field" WHERE name=${
      matchingFullField!.name
    }`) as Field[]

    const fieldsWithIntersectionArea = fields.map((field) => {
      const fieldFeatures = featureCollection([
        point(field.topLeft, { name: 'topLeft' }),
        point(field.topRight, { name: 'topRight' }),
        point(field.bottomRight, { name: 'bottomRight' }),
        point(field.bottomLeft, { name: 'bottomLeft' }),
      ])
      const fieldCover = envelope(fieldFeatures)
      const totalFieldArea = area(fieldCover)
      const intersection = intersect(geoJsonCover, fieldCover)
      const intersectionArea = match(Boolean(intersection))
        .with(true, () => area(intersection!))
        .with(false, () => 0)
        .exhaustive()

      const percentageAreaCovered = Math.round(
        (intersectionArea / totalFieldArea) * 100
      )

      return {
        field: field,
        percentageAreaCovered,
      }
    })

    const matchingField = fieldsWithIntersectionArea.reduce(
      (maxAreaField, currentField) => {
        if (
          currentField.percentageAreaCovered >
          maxAreaField.percentageAreaCovered
        ) {
          return currentField
        } else {
          return maxAreaField
        }
      },
      fieldsWithIntersectionArea[0]
    ).field

    if (Boolean(matchingField)) {
      const updatedPost = (
        await sql<Post[]>`
          UPDATE "Post"
          SET "fieldId" = ${matchingField!.id}
          WHERE "id" = ${post.id}
          RETURNING *
          `
      )[0]

      console.info(
        `info: post ${updatedPost.id} updated with a field named ${matchingField?.name} (${matchingField?.usage})`
      )
    } else {
      console.info(`info: post ${post.id} unable to find matching field`)
    }
  }
}
