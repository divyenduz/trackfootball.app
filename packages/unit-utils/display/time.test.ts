import { describe, it, expect } from 'vitest'
import {
  prettySecondsToString,
  addDurations,
  durationToSeconds,
  secondsToDuration,
} from './time'
import type { Duration } from 'date-fns'

describe('time utility functions', () => {
  describe('prettySecondsToString', () => {
    it('should format seconds to readable string', () => {
      expect(prettySecondsToString(3661)).toBe('1h 1m 1s')
      expect(prettySecondsToString(7200)).toBe('2h')
      expect(prettySecondsToString(180)).toBe('3m')
      expect(prettySecondsToString(45)).toBe('45s')
    })

    it('should handle zero seconds', () => {
      expect(prettySecondsToString(0)).toBe('0h 0m 0s')
    })

    it('should handle null/undefined as zero', () => {
      expect(prettySecondsToString(null as any)).toBe('0h 0m 0s')
      expect(prettySecondsToString(undefined as any)).toBe('0h 0m 0s')
    })

    it('should format complex durations', () => {
      expect(prettySecondsToString(3725)).toBe('1h 2m 5s')
      expect(prettySecondsToString(86400)).toBe('24h')
      expect(prettySecondsToString(90061)).toBe('25h 1m 1s')
    })

    it('should handle single units', () => {
      expect(prettySecondsToString(3600)).toBe('1h')
      expect(prettySecondsToString(60)).toBe('1m')
      expect(prettySecondsToString(1)).toBe('1s')
    })

    it('should handle combinations of two units', () => {
      expect(prettySecondsToString(3660)).toBe('1h 1m')
      expect(prettySecondsToString(61)).toBe('1m 1s')
      expect(prettySecondsToString(7201)).toBe('2h 1s')
    })
  })

  describe('secondsToDuration', () => {
    it('should convert seconds to duration object', () => {
      expect(secondsToDuration(3661)).toEqual({
        hours: 1,
        minutes: 1,
        seconds: 1,
      })
      expect(secondsToDuration(7200)).toEqual({
        hours: 2,
        minutes: 0,
        seconds: 0,
      })
      expect(secondsToDuration(180)).toEqual({
        hours: 0,
        minutes: 3,
        seconds: 0,
      })
    })

    it('should handle zero seconds', () => {
      expect(secondsToDuration(0)).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 0,
      })
    })

    it('should handle large numbers', () => {
      expect(secondsToDuration(86400)).toEqual({
        hours: 24,
        minutes: 0,
        seconds: 0,
      })
      expect(secondsToDuration(90061)).toEqual({
        hours: 25,
        minutes: 1,
        seconds: 1,
      })
    })

    it('should handle remainders correctly', () => {
      expect(secondsToDuration(3725)).toEqual({
        hours: 1,
        minutes: 2,
        seconds: 5,
      })
      expect(secondsToDuration(5432)).toEqual({
        hours: 1,
        minutes: 30,
        seconds: 32,
      })
    })
  })

  describe('durationToSeconds', () => {
    it('should convert duration object to seconds', () => {
      expect(durationToSeconds({ hours: 1, minutes: 1, seconds: 1 })).toBe(3661)
      expect(durationToSeconds({ hours: 2, minutes: 0, seconds: 0 })).toBe(7200)
      expect(durationToSeconds({ hours: 0, minutes: 3, seconds: 0 })).toBe(180)
    })

    it('should handle empty duration object', () => {
      expect(durationToSeconds({})).toBe(0)
    })

    it('should handle partial duration objects', () => {
      expect(durationToSeconds({ hours: 1 })).toBe(3600)
      expect(durationToSeconds({ minutes: 30 })).toBe(1800)
      expect(durationToSeconds({ seconds: 45 })).toBe(45)
    })

    it('should handle undefined fields', () => {
      expect(durationToSeconds({ hours: undefined, minutes: 5, seconds: undefined })).toBe(300)
      expect(durationToSeconds({ hours: 2, minutes: undefined, seconds: 30 })).toBe(7230)
    })

    it('should be inverse of secondsToDuration', () => {
      const testSeconds = [0, 1, 60, 3600, 3661, 7200, 86400]
      testSeconds.forEach((seconds) => {
        const duration = secondsToDuration(seconds)
        expect(durationToSeconds(duration)).toBe(seconds)
      })
    })
  })

  describe('addDurations', () => {
    it('should add two durations correctly', () => {
      const d1: Duration = { hours: 1, minutes: 30, seconds: 45 }
      const d2: Duration = { hours: 2, minutes: 15, seconds: 30 }
      expect(addDurations(d1, d2)).toEqual({
        hours: 3,
        minutes: 45,
        seconds: 75,
      })
    })

    it('should handle empty durations', () => {
      const d1: Duration = { hours: 1, minutes: 30, seconds: 45 }
      const empty: Duration = {}
      expect(addDurations(d1, empty)).toEqual({
        hours: 1,
        minutes: 30,
        seconds: 45,
      })
      expect(addDurations(empty, d1)).toEqual({
        hours: 1,
        minutes: 30,
        seconds: 45,
      })
    })

    it('should handle both empty durations', () => {
      expect(addDurations({}, {})).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 0,
      })
    })

    it('should handle partial durations', () => {
      const d1: Duration = { hours: 1 }
      const d2: Duration = { minutes: 30 }
      expect(addDurations(d1, d2)).toEqual({
        hours: 1,
        minutes: 30,
        seconds: 0,
      })
    })

    it('should handle undefined fields', () => {
      const d1: Duration = { hours: undefined, minutes: 30, seconds: undefined }
      const d2: Duration = { hours: 2, minutes: undefined, seconds: 15 }
      expect(addDurations(d1, d2)).toEqual({
        hours: 2,
        minutes: 30,
        seconds: 15,
      })
    })

    it('should not normalize overflow values', () => {
      const d1: Duration = { hours: 0, minutes: 45, seconds: 30 }
      const d2: Duration = { hours: 0, minutes: 45, seconds: 45 }
      expect(addDurations(d1, d2)).toEqual({
        hours: 0,
        minutes: 90,
        seconds: 75,
      })
    })

    it('should be commutative', () => {
      const d1: Duration = { hours: 1, minutes: 20, seconds: 30 }
      const d2: Duration = { hours: 2, minutes: 40, seconds: 50 }
      expect(addDurations(d1, d2)).toEqual(addDurations(d2, d1))
    })
  })

  describe('integration tests', () => {
    it('should maintain consistency between conversion functions', () => {
      const testCases = [0, 1, 60, 3600, 3661, 7200, 86400, 90061]
      
      testCases.forEach((originalSeconds) => {
        const prettyString = prettySecondsToString(originalSeconds)
        expect(prettyString).toBeTruthy()
        
        const duration = secondsToDuration(originalSeconds)
        const backToSeconds = durationToSeconds(duration)
        expect(backToSeconds).toBe(originalSeconds)
      })
    })

    it('should handle duration addition and conversion', () => {
      const d1 = secondsToDuration(3600)
      const d2 = secondsToDuration(1800)
      const sum = addDurations(d1, d2)
      const totalSeconds = durationToSeconds(sum)
      expect(totalSeconds).toBe(5400)
    })
  })
})