import type { NProgress } from 'nprogress'
import nprogress from 'nprogress'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useNProgress } from '../useNProgress'

describe('useNProgress', () => {
  // `nprogress` is a module singleton: every test must hand the bar back the
  // way it found it — no element, no status (this also stops the `start()`
  // trickle timer), default settings, no spies.
  const defaults = { ...nprogress.settings }

  beforeEach(() => {
    // `set(1)` / `done()` fade the bar out over `speed` ms in a serialized
    // queue; making it immediate keeps the afterEach drain below short and
    // deterministic (no assertion depends on the animation timing).
    nprogress.configure({ speed: 0 })
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    nprogress.remove()
    nprogress.status = null
    nprogress.configure(defaults)
    // drain the queued animation callbacks so a timer scheduled by this test
    // cannot remove a bar rendered by the next one
    await new Promise(resolve => setTimeout(resolve, 50))
  })

  it('defaults to no progress and no bar', async () => {
    const { result } = await renderHook(() => useNProgress())

    expect(result.current.progress).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(nprogress.isStarted()).toBe(false)
    expect(document.getElementById('nprogress')).toBeNull()
  })

  it('start() returns the nprogress instance and shows the bar', async () => {
    const { result, act } = await renderHook(() => useNProgress())

    let returned: NProgress | undefined
    await act(() => {
      returned = result.current.start()
    })

    expect(returned).toBe(nprogress)
    expect(result.current.progress).toBe(0)
    expect(result.current.isLoading).toBe(true)
    expect(nprogress.isStarted()).toBe(true)

    const el = document.getElementById('nprogress')
    expect(el).not.toBeNull()
    expect(el?.querySelector('.bar')).not.toBeNull()
  })

  it('done() completes the bar', async () => {
    const { result, act } = await renderHook(() => useNProgress())

    await act(() => {
      result.current.start()
    })
    expect(result.current.isLoading).toBe(true)

    let returned: NProgress | undefined
    await act(() => {
      returned = result.current.done()
    })

    expect(returned).toBe(nprogress)
    expect(result.current.progress).toBe(1)
    expect(result.current.isLoading).toBe(false)
    expect(nprogress.status).toBeNull()
  })

  it('done() on an idle bar leaves progress untouched (upstream early return)', async () => {
    const { result, act } = await renderHook(() => useNProgress())

    await act(() => {
      result.current.done()
    })

    expect(result.current.progress).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('start() keeps an existing progress (upstream only calls set(0) when idle)', async () => {
    const { result, act } = await renderHook(() => useNProgress(0.4))

    await act(() => {
      result.current.start()
    })

    expect(result.current.progress).toBe(0.4)
    expect(result.current.isLoading).toBe(true)
  })

  it('setIsLoading(true/false) starts and completes the bar', async () => {
    const { result, act } = await renderHook(() => useNProgress())

    await act(() => {
      result.current.setIsLoading(true)
    })
    expect(result.current.isLoading).toBe(true)
    expect(nprogress.isStarted()).toBe(true)

    await act(() => {
      result.current.setIsLoading(false)
    })
    expect(result.current.isLoading).toBe(false)
    expect(nprogress.status).toBeNull()
  })

  it('setProgress() updates progress and renders the bar', async () => {
    const { result, act } = await renderHook(() => useNProgress())

    await act(() => {
      result.current.setProgress(0.5)
    })

    expect(result.current.progress).toBe(0.5)
    expect(result.current.isLoading).toBe(true)
    expect(nprogress.status).toBe(0.5)

    const el = document.getElementById('nprogress')
    expect(el).not.toBeNull()
    expect(el?.querySelector('.bar')).not.toBeNull()
  })

  it('remove() clears progress and removes the bar', async () => {
    const { result, act } = await renderHook(() => useNProgress(0.5))

    expect(document.getElementById('nprogress')).not.toBeNull()

    await act(() => {
      result.current.remove()
    })

    expect(result.current.progress).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(document.getElementById('nprogress')).toBeNull()
  })

  it('initialises progress from a plain number', async () => {
    const { result } = await renderHook(() => useNProgress(0.5))

    expect(result.current.progress).toBe(0.5)
    expect(result.current.isLoading).toBe(true)
    expect(document.getElementById('nprogress')).not.toBeNull()
  })

  it('initialises from and follows a changed currentProgress prop', async () => {
    const { result, rerender } = await renderHook(
      ({ currentProgress }: { currentProgress?: number | null } = { currentProgress: 0.25 }) =>
        useNProgress(currentProgress),
      { initialProps: { currentProgress: 0.25 as number | null } },
    )

    expect(result.current.progress).toBe(0.25)
    expect(result.current.isLoading).toBe(true)

    await rerender({ currentProgress: 0.75 })
    expect(result.current.progress).toBe(0.75)
    expect(result.current.isLoading).toBe(true)

    await rerender({ currentProgress: null })
    expect(result.current.progress).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('applies options through nprogress.configure on mount', async () => {
    const configureSpy = vi.spyOn(nprogress, 'configure')
    const { result, act } = await renderHook(() => useNProgress(null, { minimum: 0.3 }))

    expect(configureSpy).toHaveBeenCalledWith({ minimum: 0.3 })
    expect(nprogress.settings.minimum).toBe(0.3)

    // `nprogress.set` clamps to the configured minimum; the hook state keeps the
    // raw value, exactly like upstream's patched `progress.value = n`
    await act(() => {
      result.current.setProgress(0.1)
    })

    expect(result.current.progress).toBe(0.1)
    expect(nprogress.status).toBe(0.3)
  })

  it('does not monkey-patch the global nprogress.set', async () => {
    const originalSet = nprogress.set

    const { result, act } = await renderHook(() => useNProgress())

    expect(nprogress.set).toBe(originalSet)

    await act(() => {
      result.current.setProgress(0.5)
    })

    expect(nprogress.set).toBe(originalSet)
  })

  it('keeps an internal write when the currentProgress prop did not change', async () => {
    const { result, act, rerender } = await renderHook(
      ({ currentProgress }: { currentProgress?: number | null } = { currentProgress: 0.25 }) =>
        useNProgress(currentProgress),
      { initialProps: { currentProgress: 0.25 as number | null } },
    )

    await act(() => {
      result.current.setProgress(0.8)
    })
    expect(result.current.progress).toBe(0.8)

    // the prop is unchanged, so the mirror effect must not clobber the write
    await rerender({ currentProgress: 0.25 })
    expect(result.current.progress).toBe(0.8)
  })
})
