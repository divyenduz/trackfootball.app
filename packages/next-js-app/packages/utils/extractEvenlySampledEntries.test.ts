import { describe, expect, it } from 'vitest'

import { extractEvenlySampledEntries } from './extractEvenlySampledEntries'

describe('extractEvenlySampledEntries tests', () => {
  it('should return evenly sampled array', () => {
    const arr = extractEvenlySampledEntries([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)
    expect(arr).toEqual([1, 3, 5, 7, 9])
  })

  it('should return original array when array size is less than number of samples', () => {
    const arr = extractEvenlySampledEntries([1, 2, 3], 5)
    expect(arr).toEqual([1, 2, 3])
  })
})
