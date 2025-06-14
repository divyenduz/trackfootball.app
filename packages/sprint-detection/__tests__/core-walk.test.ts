import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { Core } from '../core'
import { GeoData } from '../geoData'

const cwd = process.cwd()

describe('core tests - walk', () => {
  it('should test walk data', () => {
    const gpx = fs.readFileSync(
      path.join(cwd, './__tests__/fixtures/jammu-bridge-walk.gpx'),
      'utf-8'
    )
    const geoData = new GeoData('jammu-bridge-walk', gpx, 'gpx')
    const core = new Core(geoData.toGeoJson())

    expect({ sprints: core.sprints().length }).toMatchObject({ sprints: 0 })
    expect({ runs: core.runs().length }).toMatchObject({ runs: 0 })
  })
})
