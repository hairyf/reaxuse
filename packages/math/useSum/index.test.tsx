import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useSum } from '../useSum'

describe('useSum', () => {
  it('should be defined', () => {
    expect(useSum).toBeDefined()
  })

  it('array usage', async () => {
    const array = { current: [1, 2, 3, 4] }

    const { result, rerender } = await renderHook(() => useSum(array))
    expect(result.current).toBe(10)

    array.current = [-1, -2, 3, 4]
    await rerender()
    expect(result.current).toBe(4)
  })

  it('rest usage', async () => {
    const a = { current: 1 }
    const b = { current: 2 }

    const { result, rerender } = await renderHook(() => useSum(a, b, 3))
    expect(result.current).toBe(6)

    b.current = 3
    await rerender()
    expect(result.current).toBe(7)
  })

  it('should accept an array of numbers and refs', async () => {
    const value = { current: 100 }
    const array = { current: [10, value, 1000] }

    const { result, rerender } = await renderHook(() => useSum(array))
    expect(result.current).toBe(1110)

    value.current = 2000
    await rerender()
    expect(result.current).toBe(3010)
  })

  it('should accept React refs', async () => {
    const { result } = await renderHook(() => useSum(useRef(1), useRef(2), useRef(3)))

    expect(result.current).toBe(6)
  })

  it('should accept a plain array', async () => {
    const { result } = await renderHook(() => useSum([1, 2, 3, 4]))

    expect(result.current).toBe(10)
  })

  it('should return 0 with no arguments', async () => {
    const { result } = await renderHook(() => useSum())

    expect(result.current).toBe(0)
  })
})
