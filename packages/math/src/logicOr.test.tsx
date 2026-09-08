import { describe, expect, it } from 'vitest'
import { logicOr } from './logicOr'

describe('logicOr', () => {
  it('should be defined', () => {
    expect(logicOr).toBeDefined()
  })

  it('returns false when given no args', () => {
    expect(logicOr()).toBe(false)
  })

  it('returns true only when any arguments are truthy', () => {
    expect(logicOr({ current: true }, { current: true })).toBe(true)
    expect(logicOr({ current: 'foo' }, { current: false })).toBe(true)
    expect(logicOr({ current: 'foo' }, { current: 1 }, { current: false })).toBe(true)

    expect(logicOr({ current: false }, { current: false })).toBe(false)
    expect(logicOr({ current: '' }, { current: 0 })).toBe(false)
  })

  it('works with values', () => {
    expect(logicOr(true)).toBe(true)
    expect(logicOr(true, false)).toBe(true)
    expect(logicOr('foo')).toBe(true)

    expect(logicOr(false)).toBe(false)
    expect(logicOr('')).toBe(false)
    expect(logicOr(0)).toBe(false)
  })

  it('works with getter functions', () => {
    expect(logicOr(() => true)).toBe(true)
    expect(logicOr(() => true, () => false)).toBe(true)
    expect(logicOr(() => 'foo')).toBe(true)

    expect(logicOr(() => false)).toBe(false)
    expect(logicOr(() => '')).toBe(false)
    expect(logicOr(() => 0)).toBe(false)
  })
})
