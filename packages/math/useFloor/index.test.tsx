import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useFloor } from '../useFloor'

describe('useFloor', () => {
  it('should be defined', () => {
    expect(useFloor).toBeDefined()
  })

  it('should work (mirrors upstream)', async () => {
    const base = { current: 45.95 }
    const { result, rerender } = await renderHook(() => useFloor(base))

    expect(result.current).toBe(45)

    base.current = -45.05
    await rerender()
    expect(result.current).toBe(-46)
  })

  it('returns a plain number (no reactive .value)', async () => {
    const { result } = await renderHook(() => useFloor(45.95))

    expect(typeof result.current).toBe('number')
    expect(result.current).toBe(45)
  })

  it('accepts plain number values', async () => {
    const first = await renderHook(() => useFloor(45.95))
    expect(first.result.current).toBe(45)

    const second = await renderHook(() => useFloor(-45.95))
    expect(second.result.current).toBe(-46)

    const third = await renderHook(() => useFloor(7))
    expect(third.result.current).toBe(7)
  })

  it('recomputes on the next render when the input changes', async () => {
    const input = { current: 45.95 }
    const { result, rerender } = await renderHook(() => useFloor(input))

    expect(result.current).toBe(45)

    input.current = -45.05
    await rerender()
    expect(result.current).toBe(-46)

    input.current = 2.3
    await rerender()
    expect(result.current).toBe(2)
  })

  it('works with React refs', async () => {
    const first = await renderHook(() => useFloor(useRef(45.95)))
    expect(first.result.current).toBe(45)

    const second = await renderHook(() => useFloor(useRef(-45.95)))
    expect(second.result.current).toBe(-46)

    const third = await renderHook(() => useFloor(useRef(3.1415)))
    expect(third.result.current).toBe(3)
  })
})
