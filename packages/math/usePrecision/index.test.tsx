import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { usePrecision } from '../usePrecision'

describe('usePrecision', () => {
  it('should be defined', () => {
    expect(usePrecision).toBeDefined()
  })

  it('should work', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(45.125)
      return { precision: usePrecision(value, 2), setValue }
    })

    expect(result.current.precision).toBe(45.13)

    await act(() => result.current.setValue(-45.155))
    await rerender()
    expect(result.current.precision).toBe(-45.15)
  })

  it('out ceil should work', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(45.125)
      return { precision: usePrecision(value, 2, { math: 'ceil' }), setValue }
    })

    expect(result.current.precision).toBe(45.13)

    await act(() => result.current.setValue(-45.151))
    await rerender()
    expect(result.current.precision).toBe(-45.15)
  })

  it('out floor should work', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(45.129)
      return { precision: usePrecision(value, 2, { math: 'floor' }), setValue }
    })

    expect(result.current.precision).toBe(45.12)

    await act(() => result.current.setValue(-45.159))
    await rerender()
    expect(result.current.precision).toBe(-45.16)

    await act(() => result.current.setValue(2.3))
    await rerender()
    expect(result.current.precision).toBe(2.3)

    await act(() => result.current.setValue(-2.3))
    await rerender()
    expect(result.current.precision).toBe(-2.3)
  })

  it('out trunc should work', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(45.129)
      return { precision: usePrecision(value, 2, { math: 'trunc' }), setValue }
    })

    expect(result.current.precision).toBe(45.12)

    await act(() => result.current.setValue(-45.159))
    await rerender()
    expect(result.current.precision).toBe(-45.15)
  })

  it('should accept plain values', async () => {
    const { result } = await renderHook(() => usePrecision(3.1415, 2))

    expect(result.current).toBe(3.14)
  })

  it('recomputes on the next render when value or digits change', async () => {
    const { result, rerender, act } = await renderHook(() => {
      const [value, setValue] = useState(45.125)
      const [digits, setDigits] = useState(2)
      return { precision: usePrecision(value, digits), setValue, setDigits }
    })

    expect(result.current.precision).toBe(45.13)

    await act(() => result.current.setValue(-45.155))
    await rerender()
    expect(result.current.precision).toBe(-45.15)

    await act(() => result.current.setDigits(1))
    await rerender()
    expect(result.current.precision).toBe(-45.2)
  })
})
