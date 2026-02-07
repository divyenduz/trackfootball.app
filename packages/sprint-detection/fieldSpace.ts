import type { Field } from '@trackfootball/postgres'
import bearing from '@turf/bearing'
import { bearingToAzimuth, featureCollection, lineString } from '@turf/helpers'
import { match } from 'ts-pattern'

export class FieldSpace {
  constructor(private field: Field) {}

  fieldBearing() {
    const fieldDirectionOffset = match(this.field.usage)
      .with('FULL_FIELD', () => 180)
      .otherwise(() => 90)
    const fieldBearing =
      bearingToAzimuth(bearing(this.field.topLeft, this.field.bottomLeft)) +
      fieldDirectionOffset
    return fieldBearing
  }

  fieldFeatureCollection() {
    const leftLine = lineString([this.field.topLeft, this.field.bottomLeft], {
      name: 'Left Line',
      color: '#33C9EB',
    })
    const topLine = lineString([this.field.topLeft, this.field.topRight], {
      name: 'Top Line',
      color: '#FF8F4C',
    })
    const rightLine = lineString(
      [this.field.topRight!, this.field.bottomRight!],
      {
        name: 'Right Line',
        color: '#FF8F4C',
      }
    )
    const bottomLine = lineString(
      [this.field.bottomLeft, this.field.bottomRight],
      {
        name: 'Bottom Line',
        color: '#FF8F4C',
      }
    )
    const fieldEnvelope = featureCollection([
      leftLine,
      topLine,
      rightLine,
      bottomLine,
    ])
    return fieldEnvelope
  }
}
