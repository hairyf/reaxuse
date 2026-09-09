import { describe, expect, it } from 'vitest'
import { logicOr } from '../logicOr'

describe('logicOr', () => {
  it('should be defined', () => {
    expect(logicOr).toBeDefined()
  })

  it('returns false when given no args', () => {
    expect(logicOr()).toBe(false)
  })

  it('returns true only when any arguments are truthy', () => {
    expect(logicOr(true, true)).toBe(true)
    expect(logicOr('foo', false)).toBe(true)
    expect(logicOr('foo', 1, false)).toBe(true)

    expect(logicOr(false, false)).toBe(false)
    expect(logicOr('', 0)).toBe(false)
  })

  it('re-evaluates plain values on every call', () => {
    expect(logicOr(true)).toBe(true)
    expect(logicOr(true, false)).toBe(true)
    expect(logicOr('foo')).toBe(true)

    expect(logicOr(false)).toBe(false)
    expect(logicOr('')).toBe(false)
    expect(logicOr(0)).toBe(false)
  })
})
