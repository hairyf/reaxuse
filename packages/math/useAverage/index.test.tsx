import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useAverage } from '../useAverage'

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

  it('should be the average when some items are React refs', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const a = useRef(2)
      return { a, value: useAverage({ current: [1, a, 9] }) }
    })

    expect(result.current.value).toBe(4)

    await act(() => {
      result.current.a.current = 8
    })
    await rerender()
    expect(result.current.value).toBe(6)
  })

  it('should be the average when the array is a React ref', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const array = useRef([1, 2, 3, 0])
      return { array, value: useAverage(array) }
    })

    expect(result.current.value).toBe(1.5)

    await act(() => {
      result.current.array.current = [1, 2, 3, 10]
    })
    await rerender()
    expect(result.current.value).toBe(4)
  })

  it('should work with rest', async () => {
    const a = { current: 1 }
    const b = { current: 2 }

    const { result, rerender } = await renderHook(() => useAverage(a, b, 3))
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

  it('accepts a controlled state tuple for the array form', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [array, setArray] = useState([1, 2, 3])
      return { average: useAverage([array, setArray]), setArray }
    })

    expect(result.current.average).toBe(2)

    await act(() => result.current.setArray([4, 5]))
    await rerender()
    expect(result.current.average).toBe(4.5)
  })

  it('accepts a value/onChange pair for the array form', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [array, setArray] = useState([1, 2, 3])
      return { average: useAverage({ value: array, onChange: setArray }), setArray }
    })

    expect(result.current.average).toBe(2)

    await act(() => result.current.setArray([4, 5]))
    await rerender()
    expect(result.current.average).toBe(4.5)
  })

  it('accepts controlled state values as variadic arguments', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [a, setA] = useState(1)
      const [b, setB] = useState(3)
      return { average: useAverage([a, setA], { value: b, onChange: setB }), setA, setB }
    })

    expect(result.current.average).toBe(2)

    await act(() => result.current.setA(5))
    await rerender()
    expect(result.current.average).toBe(4)
  })

  it('documents the 2-element-array caveat: [1, fn] is read as a state tuple', async () => {
    const { result } = await renderHook(() => useAverage([1, () => 2]))

    // `toValue` resolves a 2-element array whose [1] is a function as the
    // `[value, setter]` tuple form, so only the first element is averaged
    expect(result.current).toBe(1)

    // pass the elements as separate arguments to average both
    expect(useAverage(1, () => 2)).toBe(1.5)
  })
})
