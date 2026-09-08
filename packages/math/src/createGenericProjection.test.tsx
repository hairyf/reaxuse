import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { createGenericProjection } from './createGenericProjection'

function numberToStringProjector(
  input: number,
  from: readonly [number, number],
  to: readonly [string, string],
) {
  return input > (from[0] + from[1]) / 2 ? to[1] : to[0]
}

describe('createGenericProjection', () => {
  it('should be defined', () => {
    expect(createGenericProjection).toBeDefined()
  })

  it('should work with a custom projector (number → string)', async () => {
    const useProjector = createGenericProjection<number, string>(
      [0, 10],
      ['low', 'high'],
      numberToStringProjector,
    )

    const low = await renderHook(() => useProjector(3))
    expect(low.result.current).toBe('low')

    const high = await renderHook(() => useProjector(8))
    expect(high.result.current).toBe('high')
  })

  it('should accept plain values and refs', async () => {
    const input = { current: 3 }
    const useProjector = createGenericProjection<number, string>(
      [0, 10],
      ['low', 'high'],
      numberToStringProjector,
    )

    const { result, rerender } = await renderHook(() => useProjector(input))
    expect(result.current).toBe('low')

    input.current = 8
    await rerender()
    expect(result.current).toBe('high')

    expect(useProjector(9)).toBe('high')
  })

  it('should resolve ref-like domains and recompute on every call', () => {
    const fromDomain = { current: [0, 10] as [number, number] }
    const toDomain = { current: [0, 100] as [number, number] }

    const useProjector = createGenericProjection<number, number>(
      fromDomain,
      toDomain,
      (input, from, to) => (input - from[0]) / (from[1] - from[0]) * (to[1] - to[0]) + to[0],
    )

    expect(useProjector(5)).toBe(50)

    fromDomain.current = [0, 20]
    expect(useProjector(5)).toBe(25)

    toDomain.current = [0, 200]
    expect(useProjector(5)).toBe(50)
  })
})
