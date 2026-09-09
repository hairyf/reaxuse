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

  it('should be max', async () => {
    const value = { current: 10 }
    const min = { current: 0 }
    const max = { current: 100 }

    const { result, rerender, act } = await renderHook(() => useClamp(value, min, max))

    expect(result.current[0]).toBe(10)

    await act(() => result.current[1](1000))
    expect(result.current[0]).toBe(100)

    max.current = 90
    await rerender()
    expect(result.current[0]).toBe(90)

    max.current = 100
    await rerender()
    expect(result.current[0]).toBe(100)
  })

  it('should be min', async () => {
    const value = { current: 10 }
    const min = { current: 0 }
    const max = { current: 100 }

    const { result, rerender, act } = await renderHook(() => useClamp(value, min, max))

    expect(result.current[0]).toBe(10)

    await act(() => result.current[1](-10))
    expect(result.current[0]).toBe(0)

    min.current = 20
    await rerender()
    expect(result.current[0]).toBe(20)

    min.current = -10
    await act(() => result.current[1](-100))
    expect(result.current[0]).toBe(-10)
  })

  it('should support a controlled state tuple', async () => {
    let external = 3
    const setExternal = (next: number | ((prev: number) => number)) => {
      external = typeof next === 'function' ? next(external) : next
    }
    const { result, rerender, act } = await renderHook(() => useClamp([external, setExternal], 0, 10))
    await act(() => result.current[1](15))
    expect(external).toBe(10)
    await rerender()
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

  it('should work with a ref value (writable)', async () => {
    const base = { current: 10 }
    const min = { current: 0 }
    const max = { current: 100 }

    const { result, rerender, act } = await renderHook(() => useClamp(base, min, max))

    expect(result.current[0]).toBe(10)

    base.current = -10
    await rerender()
    expect(result.current[0]).toBe(0)

    base.current = 110
    await rerender()
    expect(result.current[0]).toBe(100)

    // ref-backed values are writable: the setter writes the clamped value back into the ref
    await act(() => result.current[1](50))
    expect(result.current[0]).toBe(50)
  })

  it('accepts State bounds (tuple and value/onChange)', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [min, setMin] = useState(0)
      const [max, setMax] = useState(10)
      const [clamped, setClamped] = useClamp(5, [min, setMin], { value: max, onChange: setMax })
      return { clamped, setClamped, setMin, setMax }
    })

    expect(result.current.clamped).toBe(5)

    await act(() => result.current.setMax(3))
    await rerender()
    expect(result.current.clamped).toBe(3)

    await act(() => result.current.setMin(-10))
    await rerender()
    expect(result.current.clamped).toBe(3)
  })
})
