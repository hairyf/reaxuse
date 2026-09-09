import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useMin } from '../useMin'

describe('useMin', () => {
  it('should be defined', () => {
    expect(useMin).toBeDefined()
  })

  it('should accept numbers', () => {
    expect(useMin(50, 100)).toBe(50)
  })

  it('should accept a single number', () => {
    expect(useMin(50)).toBe(50)
  })

  it('should accept an array of numbers', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [array, setArray] = useState([10, 100])
      return { min: useMin(array), setArray }
    })

    expect(result.current.min).toBe(10)

    await act(() => result.current.setArray([7, 100]))
    await rerender()
    expect(result.current.min).toBe(7)
  })

  it('should accept a readonly array', () => {
    expect(useMin([10, 100] as const)).toBe(10)
  })

  it('recomputes when the variadic arguments change', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [a, setA] = useState(10)
      const [b, setB] = useState(100)
      return { min: useMin(a, b), setA, setB }
    })

    expect(result.current.min).toBe(10)

    await act(() => result.current.setA(7))
    await rerender()
    expect(result.current.min).toBe(7)

    await act(() => result.current.setB(6))
    await rerender()
    expect(result.current.min).toBe(6)
  })

  it('should accept zero arg', () => {
    expect(useMin()).toBe(Number.POSITIVE_INFINITY)
  })
})
