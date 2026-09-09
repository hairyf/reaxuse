import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useStateAutoReset } from '../useStateAutoReset'

describe('useStateAutoReset', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be defined', () => {
    expect(useStateAutoReset).toBeDefined()
  })

  it('should be default at first', async () => {
    const { result, unmount } = await renderHook(() => useStateAutoReset('default', 100))

    expect(result.current[0]).toBe('default')

    await unmount()
  })

  it('should be updated', async () => {
    const { result, act, unmount } = await renderHook(() => useStateAutoReset('default', 100))

    await act(() => {
      result.current[1]('update')
    })
    expect(result.current[0]).toBe('update')

    await unmount()
  })

  it('should be reset', async () => {
    const { result, act, unmount } = await renderHook(() => useStateAutoReset('default', 100))

    await act(() => {
      result.current[1]('update')
    })
    expect(result.current[0]).toBe('update')

    await act(() => {
      vi.advanceTimersByTime(101)
    })
    expect(result.current[0]).toBe('default')

    await unmount()
  })

  it('should support controlled State<T> input', async () => {
    let current = 'default'
    const onChange = vi.fn((value: string) => {
      current = value
    })
    const { result, act, unmount, rerender } = await renderHook(() => useStateAutoReset({ value: current, onChange }, 100))

    await act(() => result.current[1]('update'))
    expect(onChange).toHaveBeenCalledWith('update')
    current = 'update'
    await rerender()
    expect(result.current[0]).toBe('update')

    await act(() => vi.advanceTimersByTime(101))
    // the reset re-resolves the defaultValue at fire time (upstream:
    // `toValue(defaultValue)`), so the controlled object's current value is
    // written back through onChange
    expect(onChange).toHaveBeenLastCalledWith('update')
    await unmount()
  })

  it('should be reset with ref-like defaultValue and afterMs', async () => {
    const defaultValue = { current: [123] }
    const afterMs = { current: 10 }
    const { result, act, unmount } = await renderHook(() => useStateAutoReset(defaultValue, afterMs))

    await act(() => {
      result.current[1]([999])
    })
    expect(result.current[0]).toEqual([999])

    await act(() => {
      vi.advanceTimersByTime(11)
    })
    expect(result.current[0]).toEqual([123])

    await unmount()
  })

  it('should change afterMs', async () => {
    const afterMs = { current: 150 }
    const { result, act, unmount } = await renderHook(() => useStateAutoReset('default', afterMs))

    await act(() => {
      result.current[1]('update')
    })
    afterMs.current = 100

    await act(() => {
      vi.advanceTimersByTime(101)
    })
    expect(result.current[0]).toBe('update')

    await act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current[0]).toBe('default')

    await act(() => {
      result.current[1]('update')
    })

    await act(() => {
      vi.advanceTimersByTime(101)
    })
    expect(result.current[0]).toBe('default')

    await unmount()
  })

  it('should re-resolve a lazy-getter defaultValue when the timer fires', async () => {
    let fallback = 'default'
    const { result, act, unmount } = await renderHook(() => useStateAutoReset(() => fallback, 100))

    await act(() => {
      result.current[1]('update')
    })
    expect(result.current[0]).toBe('update')

    // upstream re-resolves `toValue(defaultValue)` at fire time, so the newest
    // default wins — not the first-render value
    fallback = 'new default'
    await act(() => {
      vi.advanceTimersByTime(101)
    })
    expect(result.current[0]).toBe('new default')

    await unmount()
  })

  it('should support the updater-form setter', async () => {
    const { result, act, unmount } = await renderHook(() => useStateAutoReset('default', 100))

    await act(() => {
      result.current[1](prev => `${prev}!`)
    })
    expect(result.current[0]).toBe('default!')

    await act(() => {
      vi.advanceTimersByTime(101)
    })
    expect(result.current[0]).toBe('default')

    await unmount()
  })

  it('should not reset when scope dispose', async () => {
    const { result, act, unmount } = await renderHook(() => useStateAutoReset([123] as number[], 100))

    await act(() => {
      result.current[1]([999])
    })
    expect(result.current[0]).toEqual([999])

    await unmount()

    // the pending reset timer is cleared on unmount (upstream: `tryOnScopeDispose`
    // inside the effect scope), so no reset can fire afterwards
    expect(vi.getTimerCount()).toBe(0)
  })
})
