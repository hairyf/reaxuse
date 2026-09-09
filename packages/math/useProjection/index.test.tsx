import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useProjection } from '../useProjection'

describe('useProjection', () => {
  it('should be defined', () => {
    expect(useProjection).toBeDefined()
  })

  it('projects correctly (plain number, no reactive .value)', () => {
    const projected = useProjection(5, [0, 10], [0, 100])
    expect(typeof projected).toBe('number')
    expect(projected).toBe(50)
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

  it('recomputes on the next render when the domains change', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [input, setInput] = useState(10)
      const [from, setFrom] = useState<readonly [number, number]>([0, 10])
      const [to, setTo] = useState<readonly [number, number]>([0, 100])
      return { projected: useProjection(input, from, to), setInput, setFrom, setTo }
    })

    expect(result.current.projected).toBe(100)

    await act(() => result.current.setTo([0, 200]))
    await rerender()
    expect(result.current.projected).toBe(200)

    await act(() => result.current.setFrom([0, 20]))
    await rerender()
    expect(result.current.projected).toBe(100)

    await act(() => result.current.setInput(5))
    await rerender()
    expect(result.current.projected).toBe(50)
  })
})
