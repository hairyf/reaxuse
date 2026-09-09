import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useProjection } from '../useProjection'

describe('useProjection', () => {
  it('should be defined', () => {
    expect(useProjection).toBeDefined()
  })

  it('returns a plain number (no reactive .value)', async () => {
    const { result } = await renderHook(() => useProjection(5, [0, 10], [0, 100]))

    expect(typeof result.current).toBe('number')
    expect(result.current).toBe(50)
  })

  it('projects correctly', () => {
    expect(useProjection(5, [0, 10], [0, 100])).toBe(50)
    expect(useProjection(3, [0, 10], [0, 100])).toBe(30)
    expect(useProjection(4, [0, 44], [0, 132])).toBe(12)
  })

  it('recomputes on the next render when the input changes', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [input, setInput] = useState(5)
      return { projected: useProjection(input, [0, 10], [0, 100]), setInput }
    })

    expect(result.current.projected).toBe(50)

    await act(() => result.current.setInput(8))
    await rerender()
    expect(result.current.projected).toBe(80)
  })

  it('accepts React refs for the domains', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [input, setInput] = useState(5)
      const from = useRef<readonly [number, number]>([0, 10])
      const to = useRef<readonly [number, number]>([0, 100])
      return { projected: useProjection(input, from, to), setInput, from, to }
    })

    expect(result.current.projected).toBe(50)

    await act(() => {
      result.current.from.current = [0, 20]
      result.current.to.current = [0, 200]
    })
    await act(() => result.current.setInput(10))
    await rerender()
    expect(result.current.projected).toBe(100)
  })
})
