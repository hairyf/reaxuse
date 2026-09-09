import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useClamp } from '../useClamp'

describe('useClamp', () => {
  it('should be defined', () => {
    expect(useClamp).toBeDefined()
  })

  it('should be initial value', async () => {
    const { result } = await renderHook(() => useClamp(10, 0, 100))

    expect(result.current[0]).toBe(10)
  })

  it('should clamp on set with plain values', async () => {
    const { result, act } = await renderHook(() => useClamp(0, 0, 10))

    expect(result.current[0]).toBe(0)

    await act(() => result.current[1](15))
    expect(result.current[0]).toBe(10)

    await act(() => result.current[1](-5))
    expect(result.current[0]).toBe(0)
  })

  it('should re-clamp when max shrinks', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [max, setMax] = useState(100)
      return { clamp: useClamp(10, 0, max), setMax }
    })

    expect(result.current.clamp[0]).toBe(10)

    await act(() => result.current.setMax(90))
    await rerender()
    expect(result.current.clamp[0]).toBe(10)

    await act(() => result.current.setMax(5))
    await rerender()
    expect(result.current.clamp[0]).toBe(5)
  })

  it('should re-clamp when min rises', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [min, setMin] = useState(0)
      return { clamp: useClamp(5, min, 100), setMin }
    })

    expect(result.current.clamp[0]).toBe(5)

    await act(() => result.current.setMin(20))
    await rerender()
    expect(result.current.clamp[0]).toBe(20)
  })

  it('should follow the value prop when it changes', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(10)
      return { clamp: useClamp(value, 0, 100), setValue }
    })

    expect(result.current.clamp[0]).toBe(10)

    await act(() => result.current.setValue(110))
    await rerender()
    expect(result.current.clamp[0]).toBe(100)

    await act(() => result.current.setValue(-10))
    await rerender()
    expect(result.current.clamp[0]).toBe(0)
  })
})
