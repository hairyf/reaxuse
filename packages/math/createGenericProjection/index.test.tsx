import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { createGenericProjection } from '../createGenericProjection'

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

  it('should work with a custom projector (number → string)', () => {
    const useProjector = createGenericProjection<number, string>(
      [0, 10],
      ['low', 'high'],
      numberToStringProjector,
    )

    expect(useProjector(3)).toBe('low')
    expect(useProjector(8)).toBe('high')
  })

  it('returns a plain value, not a reactive ref', () => {
    const useProjector = createGenericProjection<number, string>(
      [0, 10],
      ['low', 'high'],
      numberToStringProjector,
    )

    expect(typeof useProjector(3)).toBe('string')
    expect(useProjector(3)).not.toHaveProperty('value')
  })

  it('recomputes on the next render when the input changes', async () => {
    const useProjector = createGenericProjection<number, string>(
      [0, 10],
      ['low', 'high'],
      numberToStringProjector,
    )

    let input = 3
    const { result, rerender } = await renderHook(() => useProjector(input))
    expect(result.current).toBe('low')

    input = 8
    await rerender()
    expect(result.current).toBe('high')
  })

  it('should resolve plain domains and recompute on every call', () => {
    const projector = (input: number, from: readonly [number, number], to: readonly [number, number]) =>
      (input - from[0]) / (from[1] - from[0]) * (to[1] - to[0]) + to[0]

    const first = createGenericProjection<number, number>([0, 10], [0, 100], projector)
    expect(first(5)).toBe(50)

    const second = createGenericProjection<number, number>([0, 20], [0, 100], projector)
    expect(second(5)).toBe(25)

    const third = createGenericProjection<number, number>([0, 20], [0, 200], projector)
    expect(third(5)).toBe(50)
  })
})
