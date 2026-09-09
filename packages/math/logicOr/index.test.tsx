import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { logicOr } from '../logicOr'

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

  it('works with React refs', async () => {
    const { result: truthy } = await renderHook(() => useRef(true))
    const { result: str } = await renderHook(() => useRef('foo'))
    const { result: falsy } = await renderHook(() => useRef(false))
    const { result: empty } = await renderHook(() => useRef(''))
    const { result: zero } = await renderHook(() => useRef(0))

    expect(logicOr(truthy.current)).toBe(true)
    expect(logicOr(truthy.current, falsy.current)).toBe(true)
    expect(logicOr(str.current)).toBe(true)

    expect(logicOr(falsy.current)).toBe(false)
    expect(logicOr(empty.current)).toBe(false)
    expect(logicOr(zero.current)).toBe(false)
  })
})
