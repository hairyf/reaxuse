import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { createProjection } from './createProjection'

describe('createProjection', () => {
  it('should be defined', () => {
    expect(createProjection).toBeDefined()
  })

  it('should work with projector', async () => {
    const fromDomain = { current: [0, 10] as [number, number] }
    const toDomain = { current: [50, 100] as [number, number] }
    const input = { current: 0 }

    const useProjector = createProjection(fromDomain, toDomain)
    const { result, rerender } = await renderHook(() => useProjector(input))

    expect(result.current).toBe(50)

    input.current = 10
    await rerender()
    expect(result.current).toBe(100)

    input.current = 5
    await rerender()
    expect(result.current).toBe(75)

    input.current = 1
    await rerender()
    expect(result.current).toBe(55)

    fromDomain.current = [0, 20]
    await rerender()
    expect(result.current).toBe(52.5)

    toDomain.current = [80, 120]
    await rerender()
    expect(result.current).toBe(82)
  })

  it('should work with a custom projector', async () => {
    const useProjector = createProjection([0, 10], [0, 100], input => input * 10)
    const { result } = await renderHook(() => useProjector({ current: 7 }))

    expect(result.current).toBe(70)
  })

  it('should work with plain values', async () => {
    const useProjector = createProjection([0, 10], [50, 100])

    const first = await renderHook(() => useProjector(0))
    expect(first.result.current).toBe(50)

    const second = await renderHook(() => useProjector(10))
    expect(second.result.current).toBe(100)

    const third = await renderHook(() => useProjector(5))
    expect(third.result.current).toBe(75)

    const fourth = await renderHook(() => useProjector(1))
    expect(fourth.result.current).toBe(55)
  })

  it('should recompute on every call', () => {
    const fromDomain = { current: [0, 10] as [number, number] }
    const useProjector = createProjection(fromDomain, [0, 100])

    expect(useProjector(5)).toBe(50)

    fromDomain.current = [0, 20]
    expect(useProjector(5)).toBe(25)
  })
})
