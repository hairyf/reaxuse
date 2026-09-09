import { describe, expect, it } from 'vitest'
import { logicAnd } from '../logicAnd'

describe('logicAnd', () => {
  it('should be defined', () => {
    expect(logicAnd).toBeDefined()
  })

  it('returns true when given no args', () => {
    expect(logicAnd()).toBe(true)
  })

  it('returns true only when all arguments are truthy', () => {
    expect(logicAnd(true, true)).toBe(true)
    expect(logicAnd('foo', true)).toBe(true)
    expect(logicAnd('foo', 1)).toBe(true)

    expect(logicAnd(true, false)).toBe(false)
    expect(logicAnd('foo', 0)).toBe(false)
  })

  it('re-evaluates plain values on every call', () => {
    expect(logicAnd(true)).toBe(true)
    expect(logicAnd('foo')).toBe(true)

    expect(logicAnd(true, false)).toBe(false)
    expect(logicAnd(0)).toBe(false)
  })
})
