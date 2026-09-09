import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useAverage } from '../useAverage'

describe('useAverage', () => {
  it('should be defined', () => {
    expect(useAverage).toBeDefined()
  })

  it('should be the average', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [array, setArray] = useState([1, 2, 3])
      return { average: useAverage(array), setArray }
    })

    expect(result.current.average).toBe(2)

    await act(() => result.current.setArray([4, 5, 6]))
    await rerender()
    expect(result.current.average).toBe(5)
  })

  it('should accept a plain array', () => {
    expect(useAverage([1, 2, 3, 4])).toBe(2.5)
  })

  it('should accept a readonly array', () => {
    expect(useAverage([1, 2, 3] as const)).toBe(2)
  })

  it('should work with rest', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [a, setA] = useState(1)
      const [b, setB] = useState(2)
      return { average: useAverage(a, b, 3), setA, setB }
    })

    expect(result.current.average).toBe(2)

    await act(() => result.current.setB(11))
    await rerender()
    expect(result.current.average).toBe(5)

    await act(() => result.current.setA(10))
    await rerender()
    expect(result.current.average).toBe(8)
  })

  it('should return 0 with no arguments', () => {
    expect(useAverage()).toBe(0)
  })
})
