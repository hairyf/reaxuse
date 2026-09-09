import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useMath } from '../useMath'

describe('useMath', () => {
  it('should be defined', () => {
    expect(useMath).toBeDefined()
  })

  it('should accept numbers', () => {
    expect(useMath('pow', 2, 3)).toBe(8)
  })

  it('should support other Math methods', () => {
    expect(useMath('sqrt', 4)).toBe(2)
    expect(useMath('round', 2.5)).toBe(3)
  })

  it('recomputes on the next render when the arguments change', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [base, setBase] = useState(2)
      const [exponent, setExponent] = useState(3)
      return { power: useMath('pow', base, exponent), setBase, setExponent }
    })

    expect(result.current.power).toBe(8)

    await act(() => result.current.setExponent(4))
    await rerender()
    expect(result.current.power).toBe(16)

    await act(() => result.current.setBase(3))
    await rerender()
    expect(result.current.power).toBe(81)
  })
})
