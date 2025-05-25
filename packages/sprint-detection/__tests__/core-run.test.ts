import { Core } from '@trackfootball/sprint-detection'
import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'bun:test'

import { GeoData } from '../geoData'

const cwd = process.cwd()

describe('core tests - run', () => {
  it('should test run data', () => {
    const gpx = fs.readFileSync(
      path.join(cwd, './__tests__/fixtures/jammu-bridge-run.gpx'),
      'utf-8',
    )
    const geoData = new GeoData('jammu-bridge-run', gpx, 'gpx')
    const core = new Core(geoData.toGeoJson())

    expect({ sprints: core.sprints().length }).toMatchObject({ sprints: 1 })
    // TODO: fix this test, it is outdated and incorrect
    expect({ runs: core.runs().length }).toMatchObject({ runs: 0 })
  })
})
