import { Core } from '../core'
import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { GeoData } from '../geoData'

const cwd = process.cwd()

describe('core tests - sprint', () => {
  it('should test sprint data', () => {
    const gpx = fs.readFileSync(
      path.join(cwd, './__tests__/fixtures/jammu-bridge-sprint.gpx'),
      'utf-8'
    )
    const geoData = new GeoData('jammu-bridge-sprint', gpx, 'gpx')
    const core = new Core(geoData.toGeoJson())

    expect({ sprints: core.sprints().length }).toMatchObject({ sprints: 1 })
    expect({ runs: core.runs().length }).toMatchObject({ runs: 0 })
  })
})
