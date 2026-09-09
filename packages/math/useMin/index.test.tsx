import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useMin } from '../useMin'

describe('useMin', () => {
  it('should be defined', () => {
    expect(useMin).toBeDefined()
  })

  it('should accept numbers', async () => {
    const { result } = await renderHook(() => useMin(50, 100))

    expect(result.current).toBe(50)
  })

  it('should accept ref-like objects', async () => {
    const value1 = { current: 10 }
    const value2 = { current: 100 }
    const value3 = { current: 1000 }

    const { result, rerender } = await renderHook(() => useMin(value1, value2, value3))

    expect(result.current).toBe(10)

    value1.current = 8
    await rerender()
    expect(result.current).toBe(8)

    value2.current = 7
    await rerender()
    expect(result.current).toBe(7)

    value3.current = 6
    await rerender()
    expect(result.current).toBe(6)
  })

  it('should accept numbers and ref-like objects', async () => {
    const value1 = 10
    const value2 = { current: 100 }

    const { result, rerender } = await renderHook(() => useMin(50, value1, value2))

    expect(result.current).toBe(10)

    value2.current = 0
    await rerender()
    expect(result.current).toBe(0)
  })

  it('should accept an array of numbers', async () => {
    const array = { current: [10, 100] }

    const { result, rerender } = await renderHook(() => useMin(array))

    expect(result.current).toBe(10)

    array.current = [7, 100]
    await rerender()
    expect(result.current).toBe(7)
  })

  it('should accept React refs', async () => {
    const { result } = await renderHook(() => useMin(useRef(10), useRef(100)))

    expect(result.current).toBe(10)
  })

  it('should accept single arg', async () => {
    const { result } = await renderHook(() => useMin(50))

    expect(result.current).toBe(50)
  })

  it('should accept zero arg', async () => {
    const { result } = await renderHook(() => useMin())

    expect(result.current).toBe(Number.POSITIVE_INFINITY)
  })

  it('accepts a controlled state tuple for the array form', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [array, setArray] = useState([10, 100])
      return { min: useMin([array, setArray]), setArray }
    })

    expect(result.current.min).toBe(10)

    await act(() => result.current.setArray([7, 100]))
    await rerender()
    expect(result.current.min).toBe(7)
  })

  it('accepts a value/onChange pair for the array form', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [array, setArray] = useState([10, 100])
      return { min: useMin({ value: array, onChange: setArray }), setArray }
    })

    expect(result.current.min).toBe(10)

    await act(() => result.current.setArray([7, 100]))
    await rerender()
    expect(result.current.min).toBe(7)
  })

  it('accepts controlled state values as variadic arguments', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [a, setA] = useState(10)
      const [b, setB] = useState(100)
      return { min: useMin([a, setA], { value: b, onChange: setB }), setA, setB }
    })

    expect(result.current.min).toBe(10)

    await act(() => result.current.setA(7))
    await rerender()
    expect(result.current.min).toBe(7)
  })

  it('documents the 2-element-array caveat: [5, fn] is read as a state tuple', async () => {
    const { result } = await renderHook(() => useMin([5, () => 1]))

    // `toValue` resolves a 2-element array whose [1] is a function as the
    // `[value, setter]` tuple form, so only the first element is compared
    expect(result.current).toBe(5)

    // pass the elements as separate arguments to compare both
    expect(useMin(5, () => 1)).toBe(1)
  })
})
