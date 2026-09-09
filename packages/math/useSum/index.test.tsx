import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useSum } from '../useSum'

// Upstream `source/vueuse/packages/math/useSum/index.test.ts` also covers getter
// arguments (`useSum(() => b.value)`). Getters as data sources are rejected
// repo-wide (rule 1, issue #462), so the getter form is intentionally not ported
// and that upstream test is intentionally skipped here.

describe('useSum', () => {
  it('should be defined', () => {
    expect(useSum).toBeDefined()
  })

  it('array usage', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [array, setArray] = useState([1, 2, 3, 4])
      return { sum: useSum(array), setArray }
    })

    expect(result.current.sum).toBe(10)

    await act(() => result.current.setArray([-1, -2, 3, 4]))
    await rerender()
    expect(result.current.sum).toBe(4)
  })

  it('rest usage', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [a, setA] = useState(1)
      const [b, setB] = useState(2)
      return { sum: useSum(a, b, 3), setA, setB }
    })

    expect(result.current.sum).toBe(6)

    await act(() => result.current.setB(3))
    await rerender()
    expect(result.current.sum).toBe(7)
  })

  it('should accept a plain array', async () => {
    const { result } = await renderHook(() => useSum([1, 2, 3, 4]))

    expect(result.current).toBe(10)
  })

  it('should accept a readonly array', () => {
    expect(useSum([1, 2, 3] as const)).toBe(6)
  })

  it('should sum both elements of a 2-element array', () => {
    expect(useSum([1, 2])).toBe(3)
  })

  it('should return 0 with no arguments', () => {
    expect(useSum()).toBe(0)
  })
})
