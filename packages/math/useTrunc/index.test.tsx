import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useTrunc } from '../useTrunc'

// Returns:
//  0        ->  0
// -0        -> -0
//  0.2      ->  0
// -0.2      -> -0
//  0.7      ->  0
// -0.7      -> -0
//  Infinity ->  Infinity
// -Infinity -> -Infinity
//  NaN      ->  NaN
//  null     ->  0

describe('useTrunc', () => {
  it('should be defined', () => {
    expect(useTrunc).toBeDefined()
  })

  it('should work', async () => {
    const base = { current: 1.95 }
    const { result, rerender } = await renderHook(() => useTrunc(base))

    expect(result.current).toBe(1)

    base.current = -7.004
    await rerender()
    expect(result.current).toBe(-7)

    base.current = 0
    await rerender()
    expect(result.current).toBe(0)

    base.current = -0
    await rerender()
    expect(result.current).toBe(-0)

    base.current = 0.2
    await rerender()
    expect(result.current).toBe(0)

    base.current = -0.2
    await rerender()
    expect(result.current).toBe(-0)

    base.current = Number.POSITIVE_INFINITY
    await rerender()
    expect(result.current).toBe(Number.POSITIVE_INFINITY)

    base.current = Number.NEGATIVE_INFINITY
    await rerender()
    expect(result.current).toBe(Number.NEGATIVE_INFINITY)

    base.current = Number.NaN
    await rerender()
    expect(result.current).toBe(Number.NaN)
  })

  it('should accept plain values and React refs', async () => {
    const { result } = await renderHook(() => useTrunc(0.95))
    expect(result.current).toBe(0)

    const { result: refResult } = await renderHook(() => useTrunc(useRef(-2.34)))
    expect(refResult.current).toBe(-2)
  })

  it('accepts a controlled state tuple', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(1.95)
      return { trunc: useTrunc([value, setValue]), setValue }
    })

    expect(result.current.trunc).toBe(1)

    await act(() => result.current.setValue(-7.004))
    await rerender()
    expect(result.current.trunc).toBe(-7)
  })

  it('accepts a value/onChange pair', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(1.95)
      return { trunc: useTrunc({ value, onChange: setValue }), setValue }
    })

    expect(result.current.trunc).toBe(1)

    await act(() => result.current.setValue(-7.004))
    await rerender()
    expect(result.current.trunc).toBe(-7)
  })
})
