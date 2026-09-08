import { describe, expect, it } from 'vitest'
import { logicNot } from './logicNot'

describe('logicNot', () => {
  it('should be defined', () => {
    expect(logicNot).toBeDefined()
  })

  it('returns the logical complement of the given ref-like value', () => {
    expect(logicNot({ current: true })).toBe(false)
    expect(logicNot({ current: 'foo' })).toBe(false)
    expect(logicNot({ current: 1 })).toBe(false)

    expect(logicNot({ current: false })).toBe(true)
    expect(logicNot({ current: '' })).toBe(true)
    expect(logicNot({ current: 0 })).toBe(true)
  })

  it('returns the logical complement of the given value', () => {
    expect(logicNot(true)).toBe(false)
    expect(logicNot('foo')).toBe(false)

    expect(logicNot(false)).toBe(true)
    expect(logicNot('')).toBe(true)
    expect(logicNot(0)).toBe(true)
  })

  it('returns the logical complement of the given getter function', () => {
    expect(logicNot(() => true)).toBe(false)
    expect(logicNot(() => 'foo')).toBe(false)

    expect(logicNot(() => false)).toBe(true)
    expect(logicNot(() => 0)).toBe(true)
  })

  it('re-evaluates ref-like values on every call', () => {
    const a: { current: any } = { current: true }

    expect(logicNot(a)).toBe(false)

    a.current = false
    expect(logicNot(a)).toBe(true)

    a.current = 1
    expect(logicNot(a)).toBe(false)
  })
})
