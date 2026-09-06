import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useProjection } from './useProjection'

describe('useProjection', () => {
  it('should be defined', () => {
    expect(useProjection).toBeDefined()
  })

  it('returns a plain number (no reactive .value)', async () => {
    const { result } = await renderHook(() => useProjection({ current: 5 }, [0, 10], [0, 100]))

    expect(typeof result.current).toBe('number')
    expect(result.current).toBe(50)
  })

  it('projects correctly', async () => {
    const first = await renderHook(() => useProjection(5, [0, 10], [0, 100]))
    expect(first.result.current).toBe(50)

    const second = await renderHook(() => useProjection(3, [0, 10], [0, 100]))
    expect(second.result.current).toBe(30)

    const third = await renderHook(() => useProjection(4, [0, 44], [0, 132]))
    expect(third.result.current).toBe(12)
  })

  it('recomputes on the next render when the input changes', async () => {
    const input = { current: 5 }
    const { result, rerender } = await renderHook(() => useProjection(input, [0, 10], [0, 100]))

    expect(result.current).toBe(50)

    input.current = 8
    await rerender()
    expect(result.current).toBe(80)

    input.current = 2.3
    await rerender()
    expect(result.current).toBe(23)
  })

  it('works with getter functions', async () => {
    const { result } = await renderHook(() => useProjection(() => 5, [0, 10], [0, 100]))
    expect(result.current).toBe(50)

    const second = await renderHook(() => useProjection(() => 3, [0, 10], [0, 100]))
    expect(second.result.current).toBe(30)

    const third = await renderHook(() => useProjection(() => 4, [0, 44], [0, 132]))
    expect(third.result.current).toBe(12)
  })
})
