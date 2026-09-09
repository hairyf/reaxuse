import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useMath } from '../useMath'

describe('useMath', () => {
  it('should be defined', () => {
    expect(useMath).toBeDefined()
  })

  it('should accept numbers', async () => {
    const { result } = await renderHook(() => useMath('pow', 2, 3))

    expect(result.current).toBe(8)
  })

  it('should accept refs', async () => {
    const base = { current: 2 }
    const exponent = { current: 3 }
    const { result } = await renderHook(() => useMath('pow', base, exponent))

    expect(result.current).toBe(8)

    const num = { current: 4 }
    const { result: rootResult, rerender: rerenderRoot } = await renderHook(() => useMath('sqrt', num))

    expect(rootResult.current).toBe(2)

    num.current = 16
    await rerenderRoot()
    expect(rootResult.current).toBe(4)
  })

  it('should accept React refs', async () => {
    const { result } = await renderHook(() => useMath('pow', useRef(2), useRef(3)))

    expect(result.current).toBe(8)

    const { result: rootResult } = await renderHook(() => useMath('sqrt', useRef(4)))

    expect(rootResult.current).toBe(2)
  })

  it('accepts controlled state values as arguments', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [base, setBase] = useState(2)
      const [exponent, setExponent] = useState(3)
      return {
        power: useMath('pow', [base, setBase], { value: exponent, onChange: setExponent }),
        setBase,
        setExponent,
      }
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
