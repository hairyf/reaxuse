import { describe, expect, it } from 'vitest'
import { logicNot } from '../logicNot'

describe('logicNot', () => {
  it('should be defined', () => {
    expect(logicNot).toBeDefined()
  })

  it('returns the logical complement of the given value', () => {
    expect(logicNot(true)).toBe(false)
    expect(logicNot('foo')).toBe(false)
    expect(logicNot(1)).toBe(false)

    expect(logicNot(false)).toBe(true)
    expect(logicNot('')).toBe(true)
    expect(logicNot(0)).toBe(true)
  })

  it('re-evaluates plain values on every call', () => {
    expect(logicNot(true)).toBe(false)
    expect(logicNot('foo')).toBe(false)

    expect(logicNot(false)).toBe(true)
    expect(logicNot('')).toBe(true)
    expect(logicNot(0)).toBe(true)
  })
})
