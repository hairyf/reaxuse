import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useCeil } from './useCeil'

describe('useCeil', () => {
  it('should be defined', () => {
    expect(useCeil).toBeDefined()
  })

  it('should work (mirrors upstream)', async () => {
    const base = { current: 0.95 }
    const { result, rerender } = await renderHook(() => useCeil(base))

    expect(result.current).toBe(1)

    base.current = -7.004
    await rerender()
    expect(result.current).toBe(-7)
  })

  it('returns a plain number (no reactive .value)', async () => {
    const { result } = await renderHook(() => useCeil(0.95))

    expect(typeof result.current).toBe('number')
    expect(result.current).toBe(1)
  })

  it('accepts plain number values', async () => {
    const first = await renderHook(() => useCeil(0.95))
    expect(first.result.current).toBe(1)

    const second = await renderHook(() => useCeil(-7.004))
    expect(second.result.current).toBe(-7)

    const third = await renderHook(() => useCeil(7))
    expect(third.result.current).toBe(7)
  })

  it('recomputes on the next render when the input changes', async () => {
    const input = { current: 0.95 }
    const { result, rerender } = await renderHook(() => useCeil(input))

    expect(result.current).toBe(1)

    input.current = -7.004
    await rerender()
    expect(result.current).toBe(-7)

    input.current = 2.3
    await rerender()
    expect(result.current).toBe(3)
  })

  it('works with getter functions', async () => {
    const { result } = await renderHook(() => useCeil(() => 0.95))
    expect(result.current).toBe(1)

    const second = await renderHook(() => useCeil(() => -7.004))
    expect(second.result.current).toBe(-7)

    const third = await renderHook(() => useCeil(() => 3.1415))
    expect(third.result.current).toBe(4)
  })
})
