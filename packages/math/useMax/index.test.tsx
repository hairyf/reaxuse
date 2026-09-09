import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useMax } from '../useMax'

describe('useMax', () => {
  it('should be defined', () => {
    expect(useMax).toBeDefined()
  })

  it('should accept numbers', () => {
    expect(useMax(50, 100)).toBe(100)
  })

  it('should accept a single number', () => {
    expect(useMax(50)).toBe(50)
  })

  it('should accept an array of numbers', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [array, setArray] = useState([1, 5, 3, 8])
      return { max: useMax(array), setArray }
    })

    expect(result.current.max).toBe(8)

    await act(() => result.current.setArray([1, 5, 3, 10]))
    await rerender()
    expect(result.current.max).toBe(10)
  })

  it('should accept a readonly array', () => {
    expect(useMax([1, 5, 3] as const)).toBe(5)
  })

  it('recomputes when the variadic arguments change', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [a, setA] = useState(1)
      const [b, setB] = useState(3)
      return { max: useMax(a, b), setA, setB }
    })

    expect(result.current.max).toBe(3)

    await act(() => result.current.setA(10))
    await rerender()
    expect(result.current.max).toBe(10)

    await act(() => result.current.setB(20))
    await rerender()
    expect(result.current.max).toBe(20)
  })

  it('should accept zero arg', () => {
    expect(useMax()).toBe(Number.NEGATIVE_INFINITY)
  })
})
