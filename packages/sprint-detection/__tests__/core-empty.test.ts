import { Core } from '@trackfootball/sprint-detection'
import { describe, expect, it } from 'vitest'

describe('core - empty data tests', () => {
  const geoJson = require('./fixtures/empty.json')
  const core = new Core(geoJson)

  it('should work base numeric metrics with empty data', () => {
    const totalDistance = core.totalDistance()
    const averageSpeed = core.averageSpeed()
    const maxSpeed = core.maxSpeed()
    const elapsedTime = core.elapsedTime()
    const totalSprintTime = core.totalSprintTime()
    expect({
      totalDistance,
      averageSpeed,
      maxSpeed,
      elapsedTime,
      totalSprintTime,
    }).toMatchSnapshot()
  })

  it('should not fail at sprints with empty data', () => {
    const sprints = core.sprints()
    expect({ sprints: sprints.length }).toMatchObject({ sprints: 0 })
  })
})
