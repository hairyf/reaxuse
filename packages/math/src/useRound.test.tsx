import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useRound } from './useRound'

describe('useRound', () => {
  it('should be defined', () => {
    expect(useRound).toBeDefined()
  })

  it('should work (mirrors upstream)', async () => {
    const base = { current: 20.49 }
    const { result, rerender } = await renderHook(() => useRound(base))

    expect(result.current).toBe(20)

    base.current = -20.51
    await rerender()
    expect(result.current).toBe(-21)
  })

  it('returns a plain number (no reactive .value)', async () => {
    const { result } = await renderHook(() => useRound(20.49))

    expect(typeof result.current).toBe('number')
    expect(result.current).toBe(20)
  })

  it('accepts plain number values', async () => {
    const first = await renderHook(() => useRound(20.49))
    expect(first.result.current).toBe(20)

    const second = await renderHook(() => useRound(-20.51))
    expect(second.result.current).toBe(-21)

    const third = await renderHook(() => useRound(7))
    expect(third.result.current).toBe(7)
  })

  it('recomputes on the next render when the input changes', async () => {
    const input = { current: 20.49 }
    const { result, rerender } = await renderHook(() => useRound(input))

    expect(result.current).toBe(20)

    input.current = -20.51
    await rerender()
    expect(result.current).toBe(-21)

    input.current = 2.3
    await rerender()
    expect(result.current).toBe(2)
  })

  it('works with getter functions', async () => {
    const { result } = await renderHook(() => useRound(() => 20.49))
    expect(result.current).toBe(20)

    const second = await renderHook(() => useRound(() => -20.51))
    expect(second.result.current).toBe(-21)

    const third = await renderHook(() => useRound(() => 3.1415))
    expect(third.result.current).toBe(3)
  })
})
