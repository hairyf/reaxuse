import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useAbs } from './useAbs'

describe('useAbs', () => {
  it('should be defined', () => {
    expect(useAbs).toBeDefined()
  })

  it('should work (mirrors upstream)', async () => {
    const base = { current: -1 }
    const { result, rerender } = await renderHook(() => useAbs(base))

    expect(result.current).toBe(1)

    base.current = -23
    await rerender()
    expect(result.current).toBe(23)

    base.current = 10
    await rerender()
    expect(result.current).toBe(10)

    base.current = 0
    await rerender()
    expect(result.current).toBe(0)
  })

  it('accepts plain number values', async () => {
    const first = await renderHook(() => useAbs(-1))
    expect(first.result.current).toBe(1)

    const second = await renderHook(() => useAbs(23))
    expect(second.result.current).toBe(23)

    const third = await renderHook(() => useAbs(0))
    expect(third.result.current).toBe(0)
  })

  it('returns a plain number (no reactive .value)', async () => {
    const base = { current: -23 }
    const { result } = await renderHook(() => useAbs(base))

    expect(typeof result.current).toBe('number')
    expect(result.current).toBe(23)
  })

  it('works with getter functions', async () => {
    const base = { current: -1 }
    const { result, rerender } = await renderHook(() => useAbs(() => base.current))

    expect(result.current).toBe(1)

    base.current = -23
    await rerender()
    expect(result.current).toBe(23)

    base.current = 10
    await rerender()
    expect(result.current).toBe(10)

    base.current = 0
    await rerender()
    expect(result.current).toBe(0)
  })
})
