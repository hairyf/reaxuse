import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useRafFn } from './useRafFn'

describe('useRafFn', () => {
  it('should be defined', () => {
    expect(useRafFn).toBeDefined()
  })

  it('should call the passed function', async () => {
    const fn = vi.fn()
    await renderHook(() => useRafFn(fn))
    await vi.waitFor(() => {
      expect(fn).toHaveBeenCalled()
    })
  })

  it('should immediately be active', async () => {
    const { result } = await renderHook(() => useRafFn(() => {}))
    expect(result.current.isActive).toBe(true)
  })

  it('should not be immediately active with options.immediate=false', async () => {
    const { result } = await renderHook(() => useRafFn(() => {}, { immediate: false }))
    expect(result.current.isActive).toBe(false)
  })

  it('should not be active after pause', async () => {
    const { result, act } = await renderHook(() => useRafFn(() => {}))
    expect(result.current.isActive).toBe(true)
    await act(async () => {
      result.current.pause()
    })
    expect(result.current.isActive).toBe(false)
  })

  it('should be active after resume', async () => {
    const { result, act } = await renderHook(() => useRafFn(() => {}))
    expect(result.current.isActive).toBe(true)
    await act(async () => {
      result.current.pause()
    })
    expect(result.current.isActive).toBe(false)
    await act(async () => {
      result.current.resume()
    })
    expect(result.current.isActive).toBe(true)
  })

  it('should be active after resume and immediate false', async () => {
    const { result, act } = await renderHook(() => useRafFn(() => {}, { immediate: false }))
    expect(result.current.isActive).toBe(false)
    await act(async () => {
      result.current.resume()
    })
    expect(result.current.isActive).toBe(true)
  })

  it('should call the function with delta and timestamp', async () => {
    const fn = vi.fn()
    await renderHook(() => useRafFn(fn))
    await vi.waitFor(() => {
      expect(fn).toHaveBeenCalled()
    })
    expect(fn.mock.calls[0][0]?.delta).toBeDefined()
    expect(fn.mock.calls[0][0]?.timestamp).toBeDefined()
  })

  it('should apply a framerate', async () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    await renderHook(() => useRafFn(fn1, { fpsLimit: 20 }))
    await renderHook(() => useRafFn(fn2, { fpsLimit: 60 }))
    await vi.waitFor(() => {
      expect(fn1).toHaveBeenCalled()
      expect(fn2).toHaveBeenCalled()
    })
    expect(fn1.mock.calls.length).toBeLessThan(fn2.mock.calls.length)
  })

  it('should handle a reactive null fpsLimit as no limit', async () => {
    const fn = vi.fn()
    const limit = { current: null as number | null }
    await renderHook(() => useRafFn(fn, { fpsLimit: limit }))
    await vi.waitFor(() => {
      expect(fn).toHaveBeenCalled()
    })
  })

  it('should handle a framerate change', { retry: 3 }, async () => {
    const initialFramerate = 60
    const fr = { current: initialFramerate }
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    await renderHook(() => useRafFn(fn1, { fpsLimit: fr }))
    await renderHook(() => useRafFn(fn2, { fpsLimit: initialFramerate }))
    await vi.waitFor(() => {
      expect(fn1).toHaveBeenCalled()
      expect(fn2).toHaveBeenCalled()
    })
    // potentially flaky ?
    expect(fn1.mock.calls.length).toBe(fn2.mock.calls.length)
    fr.current = 20
    vi.clearAllMocks()
    await vi.waitFor(() => {
      expect(fn1).toHaveBeenCalled()
      expect(fn2).toHaveBeenCalled()
    })
    expect(fn1.mock.calls.length).toBeLessThan(fn2.mock.calls.length)
  })

  it('should only be called once when the once option is set to true', async () => {
    const fn = vi.fn()
    const fn1 = vi.fn()
    await renderHook(() => useRafFn(fn, { once: true }))
    await renderHook(() => useRafFn(fn1))
    await vi.waitFor(() => {
      expect(fn).toHaveBeenCalled()
      expect(fn1).toHaveBeenCalled()
    })

    expect(fn.mock.calls.length).toBe(1)
    expect(fn1.mock.calls.length).toBeGreaterThan(1)
  })
})
