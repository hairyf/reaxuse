import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { logicAnd } from '../logicAnd'

describe('logicAnd', () => {
  it('should be defined', () => {
    expect(logicAnd).toBeDefined()
  })

  it('returns true when given no args', () => {
    expect(logicAnd()).toBe(true)
  })

  it('returns true only when all arguments are truthy', () => {
    expect(logicAnd({ current: true }, { current: true })).toBe(true)
    expect(logicAnd({ current: 'foo' }, { current: true })).toBe(true)
    expect(logicAnd({ current: 'foo' }, { current: 1 })).toBe(true)

    expect(logicAnd({ current: true }, { current: false })).toBe(false)
    expect(logicAnd({ current: 'foo' }, { current: 0 })).toBe(false)
  })

  it('works with plain values', () => {
    expect(logicAnd(true)).toBe(true)
    expect(logicAnd('foo')).toBe(true)

    expect(logicAnd(true, false)).toBe(false)
    expect(logicAnd(0)).toBe(false)
  })

  it('works with React refs', async () => {
    const { result: truthy } = await renderHook(() => useRef(true))
    const { result: str } = await renderHook(() => useRef('foo'))
    const { result: falsy } = await renderHook(() => useRef(false))
    const { result: zero } = await renderHook(() => useRef(0))

    expect(logicAnd(truthy.current)).toBe(true)
    expect(logicAnd(str.current)).toBe(true)

    expect(logicAnd(truthy.current, falsy.current)).toBe(false)
    expect(logicAnd(zero.current)).toBe(false)
  })

  it('re-evaluates ref-like values on every call', () => {
    const a: { current: any } = { current: true }
    const b: { current: any } = { current: true }

    expect(logicAnd(a, b)).toBe(true)

    a.current = false
    expect(logicAnd(a, b)).toBe(false)

    a.current = 1
    b.current = ''
    expect(logicAnd(a, b)).toBe(false)
  })

  it('accepts controlled state tuples and value/onChange pairs', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [a, setA] = useState(true)
      const [b, setB] = useState(false)
      return {
        both: logicAnd([a, setA], { value: b, onChange: setB }),
        setA,
        setB,
      }
    })

    expect(result.current.both).toBe(false)

    await act(() => result.current.setB(true))
    await rerender()
    expect(result.current.both).toBe(true)

    await act(() => result.current.setA(false))
    await rerender()
    expect(result.current.both).toBe(false)
  })
})
