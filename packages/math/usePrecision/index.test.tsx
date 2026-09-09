import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { usePrecision } from '../usePrecision'

describe('usePrecision', () => {
  it('should be defined', () => {
    expect(usePrecision).toBeDefined()
  })

  it('should work', async () => {
    const base = { current: 45.125 }
    const { result, rerender } = await renderHook(() => usePrecision(base, 2))

    expect(result.current).toBe(45.13)

    base.current = -45.155
    await rerender()
    expect(result.current).toBe(-45.15)
  })

  it('out ceil should work', async () => {
    const base = { current: 45.125 }
    const { result, rerender } = await renderHook(() => usePrecision(base, 2, { math: 'ceil' }))

    expect(result.current).toBe(45.13)

    base.current = -45.151
    await rerender()
    expect(result.current).toBe(-45.15)
  })

  it('out floor should work', async () => {
    const base = { current: 45.129 }
    const { result, rerender } = await renderHook(() => usePrecision(base, 2, { math: 'floor' }))

    expect(result.current).toBe(45.12)

    base.current = -45.159
    await rerender()
    expect(result.current).toBe(-45.16)

    base.current = 2.3
    await rerender()
    expect(result.current).toBe(2.3)

    base.current = -2.3
    await rerender()
    expect(result.current).toBe(-2.3)
  })

  it('out trunc should work', async () => {
    const base = { current: 45.129 }
    const { result, rerender } = await renderHook(() => usePrecision(base, 2, { math: 'trunc' }))

    expect(result.current).toBe(45.12)

    base.current = -45.159
    await rerender()
    expect(result.current).toBe(-45.15)
  })

  it('should accept plain values', async () => {
    const { result } = await renderHook(() => usePrecision(3.1415, 2))

    expect(result.current).toBe(3.14)
  })

  it('accepts a controlled state tuple as the value', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(45.125)
      return { precision: usePrecision([value, setValue], 2), setValue }
    })

    expect(result.current.precision).toBe(45.13)

    await act(() => result.current.setValue(-45.155))
    await rerender()
    expect(result.current.precision).toBe(-45.15)
  })

  it('accepts a value/onChange pair as the value', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(45.125)
      return { precision: usePrecision({ value, onChange: setValue }, 2), setValue }
    })

    expect(result.current.precision).toBe(45.13)

    await act(() => result.current.setValue(-45.155))
    await rerender()
    expect(result.current.precision).toBe(-45.15)
  })
})
