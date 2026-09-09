import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useCeil } from '../useCeil'

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

  it('works with React refs', async () => {
    const first = await renderHook(() => useCeil(useRef(0.95)))
    expect(first.result.current).toBe(1)

    const second = await renderHook(() => useCeil(useRef(-7.004)))
    expect(second.result.current).toBe(-7)

    const third = await renderHook(() => useCeil(useRef(3.1415)))
    expect(third.result.current).toBe(4)
  })

  it('accepts a controlled state tuple', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(0.95)
      return { ceil: useCeil([value, setValue]), setValue }
    })

    expect(result.current.ceil).toBe(1)

    await act(() => result.current.setValue(-7.004))
    await rerender()
    expect(result.current.ceil).toBe(-7)
  })

  it('accepts a value/onChange pair', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(0.95)
      return { ceil: useCeil({ value, onChange: setValue }), setValue }
    })

    expect(result.current.ceil).toBe(1)

    await act(() => result.current.setValue(-7.004))
    await rerender()
    expect(result.current.ceil).toBe(-7)
  })
})
