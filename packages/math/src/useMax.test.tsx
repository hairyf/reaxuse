import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useMax } from './useMax'

describe('useMax', () => {
  it('should be defined', () => {
    expect(useMax).toBeDefined()
  })

  it('should accept numbers', async () => {
    const { result } = await renderHook(() => useMax(50, 100))

    expect(result.current).toBe(100)
  })

  it('should accept refs', async () => {
    const value1 = { current: 10 }
    const value2 = { current: 100 }
    const value3 = { current: 1000 }

    const { result, rerender } = await renderHook(() => useMax(value1, value2, value3))
    expect(result.current).toBe(1000)

    value1.current = 2000
    await rerender()
    expect(result.current).toBe(2000)

    value2.current = 2001
    await rerender()
    expect(result.current).toBe(2001)

    value3.current = 2002
    await rerender()
    expect(result.current).toBe(2002)
  })

  it('should accept numbers and refs', async () => {
    const value1 = 10
    const value2 = { current: 100 }

    const { result, rerender } = await renderHook(() => useMax(50, value1, value2))

    expect(result.current).toBe(100)

    value2.current = 200
    await rerender()
    expect(result.current).toBe(200)
  })

  it('should accept an array of numbers', async () => {
    const { result } = await renderHook(() => useMax([1, 5, 3, 8]))

    expect(result.current).toBe(8)
  })

  it('should accept an array of numbers and refs', async () => {
    const value = { current: 100 }
    const array = { current: [10, value, 1000] }

    const { result, rerender } = await renderHook(() => useMax(array))
    expect(result.current).toBe(1000)

    value.current = 2000
    await rerender()
    expect(result.current).toBe(2000)
  })

  it('should accept getters', async () => {
    const { result } = await renderHook(() => useMax(() => 1, () => 50, () => 5))

    expect(result.current).toBe(50)
  })

  it('should accept single arg', async () => {
    const { result } = await renderHook(() => useMax(50))

    expect(result.current).toBe(50)
  })

  it('should accept zero arg', async () => {
    const { result } = await renderHook(() => useMax())

    expect(result.current).toBe(Number.NEGATIVE_INFINITY)
  })
})
