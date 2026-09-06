import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { useIdle } from './useIdle'

describe('useIdle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with correct default values', async () => {
    const { result } = await renderHook(() => useIdle(60_000))

    expect(result.current.idle).toBe(false)
    expect(result.current.lastActive).toBeTypeOf('number')
  })

  it('should become idle after timeout', async () => {
    const timeout = 1000
    const { result, act } = await renderHook(() => useIdle(timeout))

    expect(result.current.idle).toBe(false)

    await act(() => {
      vi.advanceTimersByTime(timeout)
    })

    expect(result.current.idle).toBe(true)
  })

  it('should reset idle state on user activity', async () => {
    const timeout = 1000
    const { result, act } = await renderHook(() => useIdle(timeout))

    await act(() => {
      vi.advanceTimersByTime(timeout)
    })
    expect(result.current.idle).toBe(true)

    // Simulate user activity
    await act(async () => {
      await userEvent.keyboard('foo')
    })
    expect(result.current.idle).toBe(false)

    // Should become idle again after timeout
    // todo: why +50? — the trailing throttle-filter invocation adds 50ms
    await act(() => {
      vi.advanceTimersByTime(timeout + 50)
    })
    expect(result.current.idle).toBe(true)
  })

  it('should accept custom events list', async () => {
    document.body.innerHTML = ''
    const button = document.createElement('button')
    document.body.appendChild(button)

    const timeout = 1000
    const customEvents: (keyof WindowEventMap)[] = ['click', 'keypress']
    const { result, act } = await renderHook(() => useIdle(timeout, { events: customEvents }))

    await act(() => {
      vi.advanceTimersByTime(timeout)
    })
    expect(result.current.idle).toBe(true)

    // Should not respond to mousemove (not in custom events)
    await act(async () => {
      await userEvent.hover(button)
    })
    expect(result.current.idle).toBe(true)

    // Should respond to click (in custom events)
    await act(async () => {
      await userEvent.click(button)
    })
    expect(result.current.idle).toBe(false)
  })

  it('should respect initialState option', async () => {
    const { result } = await renderHook(() => useIdle(1000, { initialState: true }))
    expect(result.current.idle).toBe(true)
  })

  it('should handle visibility change events', async () => {
    const timeout = 1000
    const { result, act } = await renderHook(() => useIdle(timeout))

    await act(() => {
      vi.advanceTimersByTime(timeout)
    })
    expect(result.current.idle).toBe(true)

    await act(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(result.current.idle).toBe(false)
  })

  it('should not respond to visibility change when disabled', async () => {
    const timeout = 1000
    const { result, act } = await renderHook(() => useIdle(timeout, { listenForVisibilityChange: false }))

    await act(() => {
      vi.advanceTimersByTime(timeout)
    })
    expect(result.current.idle).toBe(true)

    await act(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(result.current.idle).toBe(true)
  })

  it('should properly cleanup timers on stop', async () => {
    const timeout = 1000
    const { result, act } = await renderHook(() => useIdle(timeout))

    expect(result.current.idle).toBe(false)

    await act(() => {
      result.current.stop()
    })
    await act(() => {
      vi.advanceTimersByTime(timeout)
    })

    // Should remain in initialState (false)
    expect(result.current.idle).toBe(false)
  })

  it('should properly restart after stopping', async () => {
    const timeout = 1000
    const { result, act } = await renderHook(() => useIdle(timeout))

    await act(() => {
      vi.advanceTimersByTime(timeout)
    })
    expect(result.current.idle).toBe(true)

    await act(() => {
      result.current.stop()
    })
    expect(result.current.idle).toBe(false)

    await act(() => {
      result.current.start()
    })
    expect(result.current.idle).toBe(false)

    await act(() => {
      vi.advanceTimersByTime(timeout)
    })
    expect(result.current.idle).toBe(true)
  })

  it('should update lastActive timestamp on activity', async () => {
    const timeout = 1000
    const { result, act } = await renderHook(() => useIdle(timeout))
    const initialTime = result.current.lastActive

    // Advance time and simulate activity
    await act(() => {
      vi.advanceTimersByTime(500)
    })
    await act(async () => {
      await userEvent.keyboard('foo')
    })

    // Should have updated the lastActive time
    expect(result.current.lastActive).toBeGreaterThan(initialTime)
  })

  it('should reset idle state with reset method', async () => {
    const timeout = 1000
    const { result, act } = await renderHook(() => useIdle(timeout))

    await act(() => {
      vi.advanceTimersByTime(timeout)
    })
    expect(result.current.idle).toBe(true)

    await act(() => {
      result.current.reset()
    })
    expect(result.current.idle).toBe(false)

    await act(() => {
      vi.advanceTimersByTime(timeout)
    })
    expect(result.current.idle).toBe(true)
  })

  it('should set isPending to true when started', async () => {
    const { result, act } = await renderHook(() => useIdle(1000))

    expect(result.current.isPending).toBe(true)

    await act(() => {
      result.current.stop()
    })
    expect(result.current.isPending).toBe(false)

    await act(() => {
      result.current.start()
    })
    expect(result.current.isPending).toBe(true)
  })

  it('should set isPending to false when stopped', async () => {
    const { result, act } = await renderHook(() => useIdle(1000))

    expect(result.current.isPending).toBe(true)

    await act(() => {
      result.current.stop()
    })
    expect(result.current.isPending).toBe(false)
  })

  it('should use initialState when starting after start', async () => {
    const { result, act } = await renderHook(() => useIdle(1000, { initialState: true }))

    expect(result.current.idle).toBe(true)

    await act(async () => {
      await userEvent.keyboard('foo')
    })
    expect(result.current.idle).toBe(false)

    await act(() => {
      result.current.stop()
    })
    expect(result.current.idle).toBe(true)

    await act(() => {
      result.current.start()
    })
    expect(result.current.idle).toBe(true)

    await act(() => {
      vi.advanceTimersByTime(51)
    })
    await act(async () => {
      await userEvent.keyboard('foo')
    })
    expect(result.current.idle).toBe(false)
  })

  it('should handle false initialState correctly', async () => {
    const { result, act } = await renderHook(() => useIdle(1000, { initialState: false }))

    // Initially idle should be false
    expect(result.current.idle).toBe(false)

    // After timeout, should become idle
    await act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.idle).toBe(true)

    // Stop should set idle to initialState (false)
    await act(() => {
      result.current.stop()
    })
    expect(result.current.idle).toBe(false)

    // Start should reset to non-idle state (false)
    await act(() => {
      result.current.start()
    })
    expect(result.current.idle).toBe(false)
  })
})
