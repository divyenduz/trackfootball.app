import { describe, it, expect } from 'vitest'
import { kmphToMps, mpsToKmph, metersToKilometers } from './spatial'

describe('spatial conversion utilities', () => {
  describe('kmphToMps', () => {
    it('should convert km/h to m/s correctly', () => {
      expect(kmphToMps(36)).toBe('10.00')
      expect(kmphToMps(72)).toBe('20.00')
      expect(kmphToMps(108)).toBe('30.00')
    })

    it('should handle zero value', () => {
      expect(kmphToMps(0)).toBe('0.00')
    })

    it('should handle decimal values', () => {
      expect(kmphToMps(50)).toBe('13.89')
      expect(kmphToMps(100)).toBe('27.78')
    })

    it('should handle negative values', () => {
      expect(kmphToMps(-36)).toBe('-10.00')
      expect(kmphToMps(-72)).toBe('-20.00')
    })

    it('should round to 2 decimal places', () => {
      expect(kmphToMps(10)).toBe('2.78')
      expect(kmphToMps(25)).toBe('6.94')
    })
  })

  describe('mpsToKmph', () => {
    it('should convert m/s to km/h correctly', () => {
      expect(mpsToKmph(10)).toBe('36.00')
      expect(mpsToKmph(20)).toBe('72.00')
      expect(mpsToKmph(30)).toBe('108.00')
    })

    it('should handle zero value', () => {
      expect(mpsToKmph(0)).toBe('0.00')
    })

    it('should handle decimal values', () => {
      expect(mpsToKmph(13.89)).toBe('50.00')
      expect(mpsToKmph(27.78)).toBe('100.01')
    })

    it('should handle negative values', () => {
      expect(mpsToKmph(-10)).toBe('-36.00')
      expect(mpsToKmph(-20)).toBe('-72.00')
    })

    it('should round to 2 decimal places', () => {
      expect(mpsToKmph(2.78)).toBe('10.01')
      expect(mpsToKmph(6.94)).toBe('24.98')
    })

    it('should be inverse of kmphToMps (approximately)', () => {
      const originalKmph = 50
      const mps = parseFloat(kmphToMps(originalKmph))
      const backToKmph = parseFloat(mpsToKmph(mps))
      expect(backToKmph).toBeCloseTo(originalKmph, 1)
    })
  })

  describe('metersToKilometers', () => {
    it('should convert meters to kilometers correctly', () => {
      expect(metersToKilometers(1000)).toBe('1.00')
      expect(metersToKilometers(2500)).toBe('2.50')
      expect(metersToKilometers(5000)).toBe('5.00')
    })

    it('should handle zero value', () => {
      expect(metersToKilometers(0)).toBe('0.00')
    })

    it('should handle values less than 1 kilometer', () => {
      expect(metersToKilometers(500)).toBe('0.50')
      expect(metersToKilometers(250)).toBe('0.25')
      expect(metersToKilometers(100)).toBe('0.10')
    })

    it('should handle large values', () => {
      expect(metersToKilometers(10000)).toBe('10.00')
      expect(metersToKilometers(42195)).toBe('42.20')
      expect(metersToKilometers(100000)).toBe('100.00')
    })

    it('should handle negative values', () => {
      expect(metersToKilometers(-1000)).toBe('-1.00')
      expect(metersToKilometers(-500)).toBe('-0.50')
    })

    it('should round to 2 decimal places', () => {
      expect(metersToKilometers(1234)).toBe('1.23')
      expect(metersToKilometers(5678)).toBe('5.68')
      expect(metersToKilometers(999)).toBe('1.00')
    })
  })
})