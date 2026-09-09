import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { createProjection } from '../createProjection'

describe('createProjection', () => {
  it('should be defined', () => {
    expect(createProjection).toBeDefined()
  })

  it('should work with projector', async () => {
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

  it('should project again when the domains change and the projector is rebuilt', () => {
    expect(createProjection([0, 10], [50, 100])(1)).toBe(55)
    expect(createProjection([0, 20], [50, 100])(1)).toBe(52.5)
    expect(createProjection([0, 20], [80, 120])(1)).toBe(82)
  })

  it('should work with a custom projector', () => {
    const useProjector = createProjection([0, 10], [0, 100], input => input * 10)

    expect(useProjector(7)).toBe(70)
  })

  it('recomputes on the next render when the input changes', async () => {
    const useProjector = createProjection([0, 10], [0, 100])
    let input = 0

    const { result, rerender } = await renderHook(() => useProjector(input))
    expect(result.current).toBe(0)

    input = 5
    await rerender()
    expect(result.current).toBe(50)

    input = 10
    await rerender()
    expect(result.current).toBe(100)
  })

  it('should recompute on every call', () => {
    const useProjector = createProjection([0, 10], [0, 100])

    expect(useProjector(5)).toBe(50)
    expect(useProjector(1)).toBe(10)
    expect(useProjector(5)).toBe(50)
  })
})
