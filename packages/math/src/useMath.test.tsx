import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useMath } from './useMath'

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

  it('should accept getters', async () => {
    const { result } = await renderHook(() => useMath('pow', () => 2, () => 3))

    expect(result.current).toBe(8)

    const { result: rootResult } = await renderHook(() => useMath('sqrt', () => 4))

    expect(rootResult.current).toBe(2)
  })
})
