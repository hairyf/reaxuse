import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useAverage } from './useAverage'

describe('useAverage', () => {
  it('should be defined', () => {
    expect(useAverage).toBeDefined()
  })

  it('should be the average', async () => {
    const array = { current: [1, 2, 3] }

    const { result, rerender } = await renderHook(() => useAverage(array))
    expect(result.current).toBe(2)

    array.current = [4, 5, 6]
    await rerender()
    expect(result.current).toBe(5)
  })

  it('should be the average when some are ref', async () => {
    const a = { current: 2 }
    const array = { current: [1, a, 9] }

    const { result, rerender } = await renderHook(() => useAverage(array))
    expect(result.current).toBe(4)

    a.current = 8
    await rerender()
    expect(result.current).toBe(6)
  })

  it('should be the average when some items are getter', async () => {
    const a = { current: 1 }
    const array = { current: [1, () => a.current + 1, 9] }

    const { result, rerender } = await renderHook(() => useAverage(array))
    expect(result.current).toBe(4)

    a.current = 7
    await rerender()
    expect(result.current).toBe(6)
  })

  it('should be the average when the array is a getter', async () => {
    const array = { current: [1, 2, 3] }
    const last = { current: 0 }

    const { result, rerender } = await renderHook(() => useAverage(() => array.current.concat(last.current)))
    expect(result.current).toBe(1.5)

    last.current = 10
    await rerender()
    expect(result.current).toBe(4)
  })

  it('should work with rest', async () => {
    const a = { current: 1 }
    const b = { current: 2 }

    const { result, rerender } = await renderHook(() => useAverage(a, () => b.current, 3))
    expect(result.current).toBe(2)

    b.current = 11
    await rerender()
    expect(result.current).toBe(5)

    a.current = 10
    await rerender()
    expect(result.current).toBe(8)
  })

  it('should accept a plain array', async () => {
    const { result } = await renderHook(() => useAverage([1, 2, 3, 4]))

    expect(result.current).toBe(2.5)
  })

  it('should return 0 with no arguments', async () => {
    const { result } = await renderHook(() => useAverage())

    expect(result.current).toBe(0)
  })
})
