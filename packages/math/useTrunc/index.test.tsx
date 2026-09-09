import { useState } from 'react'
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

describe('useTrunc', () => {
  it('should be defined', () => {
    expect(useTrunc).toBeDefined()
  })

  it('should work', () => {
    expect(useTrunc(1.95)).toBe(1)
    expect(useTrunc(-7.004)).toBe(-7)
    expect(useTrunc(0)).toBe(0)
    expect(useTrunc(-0)).toBe(-0)
    expect(useTrunc(0.2)).toBe(0)
    expect(useTrunc(-0.2)).toBe(-0)
    expect(useTrunc(Number.POSITIVE_INFINITY)).toBe(Number.POSITIVE_INFINITY)
    expect(useTrunc(Number.NEGATIVE_INFINITY)).toBe(Number.NEGATIVE_INFINITY)
    expect(useTrunc(Number.NaN)).toBe(Number.NaN)
  })

  it('accepts plain values', async () => {
    const { result } = await renderHook(() => useTrunc(0.95))
    expect(result.current).toBe(0)

    const { result: negative } = await renderHook(() => useTrunc(-2.34))
    expect(negative.current).toBe(-2)
  })

  it('recomputes on the next render when the value changes', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(1.95)
      return { trunc: useTrunc(value), setValue }
    })

    expect(result.current.trunc).toBe(1)

    await act(() => result.current.setValue(-7.004))
    await rerender()
    expect(result.current.trunc).toBe(-7)

    await act(() => result.current.setValue(0))
    await rerender()
    expect(result.current.trunc).toBe(0)
  })
})
