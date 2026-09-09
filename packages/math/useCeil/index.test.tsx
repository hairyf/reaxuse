import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useCeil } from '../useCeil'

describe('useCeil', () => {
  it('should be defined', () => {
    expect(useCeil).toBeDefined()
  })

  it('should work (mirrors upstream)', () => {
    expect(useCeil(0.95)).toBe(1)
    expect(useCeil(-7.004)).toBe(-7)
    expect(useCeil(7)).toBe(7)
  })

  it('accepts plain number values', async () => {
    const first = await renderHook(() => useCeil(0.95))
    expect(first.result.current).toBe(1)

    const second = await renderHook(() => useCeil(-7.004))
    expect(second.result.current).toBe(-7)

    const third = await renderHook(() => useCeil(7))
    expect(third.result.current).toBe(7)
  })

  it('returns a plain number (no reactive .value)', async () => {
    const { result } = await renderHook(() => useCeil(0.95))

    expect(typeof result.current).toBe('number')
    expect(result.current).toBe(1)
  })

  it('recomputes on the next render when the value changes', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(0.95)
      return { ceil: useCeil(value), setValue }
    })

    expect(result.current.ceil).toBe(1)

    await act(() => result.current.setValue(-7.004))
    await rerender()
    expect(result.current.ceil).toBe(-7)

    await act(() => result.current.setValue(2.3))
    await rerender()
    expect(result.current.ceil).toBe(3)
  })
})
