import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useFloor } from '../useFloor'

describe('useFloor', () => {
  it('should be defined', () => {
    expect(useFloor).toBeDefined()
  })

  it('should work (mirrors upstream)', () => {
    expect(useFloor(45.95)).toBe(45)
    expect(useFloor(-45.05)).toBe(-46)
    expect(useFloor(7)).toBe(7)
  })

  it('accepts plain number values', async () => {
    const first = await renderHook(() => useFloor(45.95))
    expect(first.result.current).toBe(45)

    const second = await renderHook(() => useFloor(-45.95))
    expect(second.result.current).toBe(-46)

    const third = await renderHook(() => useFloor(7))
    expect(third.result.current).toBe(7)
  })

  it('returns a plain number (no reactive .value)', async () => {
    const { result } = await renderHook(() => useFloor(45.95))

    expect(typeof result.current).toBe('number')
    expect(result.current).toBe(45)
  })

  it('recomputes on the next render when the value changes', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(45.95)
      return { floor: useFloor(value), setValue }
    })

    expect(result.current.floor).toBe(45)

    await act(() => result.current.setValue(-45.05))
    await rerender()
    expect(result.current.floor).toBe(-46)

    await act(() => result.current.setValue(2.3))
    await rerender()
    expect(result.current.floor).toBe(2)
  })
})
