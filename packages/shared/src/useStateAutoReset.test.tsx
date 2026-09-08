import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useStateAutoReset } from './useStateAutoReset'

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

  it('should be reset with maybeRef', async () => {
    const { result, act, unmount } = await renderHook(() => useStateAutoReset(() => [123], () => 10))

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

  it('should not reset when scope dispose', async () => {
    // the getter is invoked both when the state initializes and when a reset
    // fires — clear the mount-time call, then make sure no reset fires
    // after unmount (upstream: `tryOnScopeDispose` inside the scope)
    const resetSpy = vi.fn(() => [123])
    const { result, act, unmount } = await renderHook(() => useStateAutoReset(resetSpy, 100))

    await act(() => {
      result.current[1]([999])
    })
    expect(result.current[0]).toEqual([999])
    resetSpy.mockClear()

    await unmount()

    vi.advanceTimersByTime(101)
    expect(resetSpy).not.toBeCalled()
  })
})
