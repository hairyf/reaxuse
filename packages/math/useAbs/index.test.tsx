import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useAbs } from '../useAbs'

describe('useAbs', () => {
  it('should be defined', () => {
    expect(useAbs).toBeDefined()
  })

  it('should work (mirrors upstream)', () => {
    expect(useAbs(-1)).toBe(1)
    expect(useAbs(-23)).toBe(23)
    expect(useAbs(10)).toBe(10)
    expect(useAbs(0)).toBe(0)
  })

  it('accepts plain number values', async () => {
    const first = await renderHook(() => useAbs(-1))
    expect(first.result.current).toBe(1)

    const second = await renderHook(() => useAbs(23))
    expect(second.result.current).toBe(23)

    const third = await renderHook(() => useAbs(0))
    expect(third.result.current).toBe(0)
  })

  it('returns a plain number (no reactive .value)', async () => {
    const { result } = await renderHook(() => useAbs(-23))

    expect(typeof result.current).toBe('number')
    expect(result.current).toBe(23)
  })

  it('recomputes on the next render when the value changes', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(-1)
      return { abs: useAbs(value), setValue }
    })

    expect(result.current.abs).toBe(1)

    await act(() => result.current.setValue(-23))
    await rerender()
    expect(result.current.abs).toBe(23)

    await act(() => result.current.setValue(10))
    await rerender()
    expect(result.current.abs).toBe(10)
  })
})
