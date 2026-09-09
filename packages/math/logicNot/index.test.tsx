import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { logicNot } from '../logicNot'

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

  it('returns the logical complement of the given React ref', async () => {
    const { result: truthy } = await renderHook(() => useRef(true))
    const { result: str } = await renderHook(() => useRef('foo'))
    const { result: falsy } = await renderHook(() => useRef(false))
    const { result: zero } = await renderHook(() => useRef(0))

    expect(logicNot(truthy.current)).toBe(false)
    expect(logicNot(str.current)).toBe(false)

    expect(logicNot(falsy.current)).toBe(true)
    expect(logicNot(zero.current)).toBe(true)
  })

  it('re-evaluates ref-like values on every call', () => {
    const a: { current: any } = { current: true }

    expect(logicNot(a)).toBe(false)

    a.current = false
    expect(logicNot(a)).toBe(true)

    a.current = 1
    expect(logicNot(a)).toBe(false)
  })

  it('accepts a controlled state tuple and a value/onChange pair', async () => {
    const tuple = await renderHook(() => {
      const [a, setA] = useState(true)
      return { notA: logicNot([a, setA]), setA }
    })

    expect(tuple.result.current.notA).toBe(false)

    await tuple.act(() => tuple.result.current.setA(false))
    await tuple.rerender()
    expect(tuple.result.current.notA).toBe(true)

    const pair = await renderHook(() => {
      const [a, setA] = useState(true)
      return { notA: logicNot({ value: a, onChange: setA }), setA }
    })

    expect(pair.result.current.notA).toBe(false)

    await pair.act(() => pair.result.current.setA(false))
    await pair.rerender()
    expect(pair.result.current.notA).toBe(true)
  })
})
