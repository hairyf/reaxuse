import { expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useVibrate } from '../useVibrate'

type VibrateSpy = ReturnType<typeof vi.fn>

/**
 * Stub `navigator.vibrate` with a spy (defined `configurable` so it can be
 * restored afterwards) and return the spy plus a restore fn.
 */
function stubNavigatorVibrate(): { vibrateSpy: VibrateSpy, restore: () => void } {
  const vibrateSpy = vi.fn(() => true)
  const original = Object.getOwnPropertyDescriptor(navigator, 'vibrate')
  Object.defineProperty(navigator, 'vibrate', { value: vibrateSpy, configurable: true })
  return {
    vibrateSpy,
    restore: () => {
      if (original)
        Object.defineProperty(navigator, 'vibrate', original)
      else
        delete (navigator as unknown as Record<string, unknown>).vibrate
    },
  }
}

it('useVibrate reports isSupported when navigator.vibrate exists', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result } = await renderHook(() => useVibrate())
    await expect.poll(() => result.current.isSupported).toBe(true)
  }
  finally {
    stub.restore()
  }
})

it('useVibrate reports isSupported false when navigator.vibrate is absent', async () => {
  // A custom navigator without `vibrate` simulates an unsupported browser
  // deterministically (the real browser may expose `vibrate` itself).
  const { result } = await renderHook(() => useVibrate({ navigator: {} as Navigator }))
  expect(result.current.isSupported).toBe(false)
})

it('useVibrate calls navigator.vibrate with the configured pattern', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result, act } = await renderHook(() => useVibrate({ pattern: [300, 100, 300] }))
    await act(() => {
      result.current.vibrate()
    })
    expect(stub.vibrateSpy).toHaveBeenCalledWith([300, 100, 300])
  }
  finally {
    stub.restore()
  }
})

it('useVibrate forwards a pattern override to navigator.vibrate', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result, act } = await renderHook(() => useVibrate({ pattern: [300, 100, 300] }))
    await act(() => {
      result.current.vibrate(50)
    })
    expect(stub.vibrateSpy).toHaveBeenCalledWith(50)
  }
  finally {
    stub.restore()
  }
})

it('useVibrate vibrates with an empty pattern by default', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result, act } = await renderHook(() => useVibrate())
    await act(() => {
      result.current.vibrate()
    })
    expect(stub.vibrateSpy).toHaveBeenCalledWith([])
  }
  finally {
    stub.restore()
  }
})

it('useVibrate is a no-op when the Vibration API is unsupported', async () => {
  // The unsupported custom navigator must gate every call — nothing may leak
  // to the real (possibly supported) global navigator.
  const { result, act } = await renderHook(() => useVibrate({ navigator: {} as Navigator }))
  expect(result.current.isSupported).toBe(false)

  await act(() => {
    result.current.vibrate(100)
    result.current.stop()
  })
})

it('useVibrate stop() cancels the vibration', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result, act } = await renderHook(() => useVibrate({ pattern: [300, 100, 300] }))
    await act(() => {
      result.current.vibrate()
      result.current.stop()
    })
    expect(stub.vibrateSpy).toHaveBeenNthCalledWith(1, [300, 100, 300])
    expect(stub.vibrateSpy).toHaveBeenLastCalledWith(0)
  }
  finally {
    stub.restore()
  }
})

it('useVibrate supports a custom navigator option', async () => {
  const vibrateSpy = vi.fn(() => true)
  const fakeNavigator = { vibrate: vibrateSpy } as unknown as Navigator
  const stub = stubNavigatorVibrate()
  try {
    const { result, act } = await renderHook(() => useVibrate({ navigator: fakeNavigator, pattern: 200 }))
    await expect.poll(() => result.current.isSupported).toBe(true)

    await act(() => {
      result.current.vibrate()
    })
    expect(vibrateSpy).toHaveBeenCalledWith(200)
    expect(stub.vibrateSpy).not.toHaveBeenCalled()
  }
  finally {
    stub.restore()
  }
})

it('useVibrate vibrate() is one-shot — it never loops on its own', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result, act } = await renderHook(() => useVibrate({ pattern: 300, interval: 100 }))
    await act(() => {
      result.current.vibrate()
    })
    expect(stub.vibrateSpy).toHaveBeenCalledTimes(1)

    // `interval > 0` alone must not start the loop (upstream: one-shot
    // vibrate(), loop only via scheduler.resume): no re-vibration follows
    await new Promise(resolve => setTimeout(resolve, 350))
    expect(stub.vibrateSpy).toHaveBeenCalledTimes(1)
  }
  finally {
    stub.restore()
  }
})

it('useVibrate exposes intervalControls and resume() starts the loop', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result, act } = await renderHook(() => useVibrate({ pattern: 300, interval: 100 }))

    expect(result.current.intervalControls).toBeDefined()
    expect(result.current.intervalControls.isActive).toBe(false)

    await act(() => {
      result.current.vibrate()
    })
    // still inactive: vibrate() is one-shot, the loop starts explicitly
    expect(result.current.intervalControls.isActive).toBe(false)

    await act(() => {
      result.current.intervalControls.resume()
    })
    expect(result.current.intervalControls.isActive).toBe(true)

    // the loop re-triggers the pattern
    await expect.poll(() => stub.vibrateSpy.mock.calls.length, { timeout: 2000 })
      .toBeGreaterThanOrEqual(2)
  }
  finally {
    stub.restore()
  }
})

it('useVibrate intervalControls.pause() stops the loop and isActive flips', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result, act } = await renderHook(() => useVibrate({ pattern: 300, interval: 100 }))
    await act(() => {
      result.current.intervalControls.resume()
    })
    expect(result.current.intervalControls.isActive).toBe(true)
    await expect.poll(() => stub.vibrateSpy.mock.calls.length, { timeout: 2000 })
      .toBeGreaterThanOrEqual(2)

    await act(() => {
      result.current.intervalControls.pause()
    })
    expect(result.current.intervalControls.isActive).toBe(false)

    const callsAfterPause = stub.vibrateSpy.mock.calls.length
    await new Promise(resolve => setTimeout(resolve, 300))
    expect(stub.vibrateSpy.mock.calls.length).toBe(callsAfterPause)
  }
  finally {
    stub.restore()
  }
})

it('useVibrate resume() with interval 0 is a no-op', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result, act } = await renderHook(() => useVibrate({ pattern: 300 }))
    await act(() => {
      result.current.intervalControls.resume()
    })
    expect(result.current.intervalControls.isActive).toBe(false)
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(stub.vibrateSpy).not.toHaveBeenCalled()
  }
  finally {
    stub.restore()
  }
})

it('useVibrate stop() cancels the loop and stops the vibration', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result, act, unmount } = await renderHook(() => useVibrate({ pattern: 300, interval: 100 }))
    await act(() => {
      result.current.intervalControls.resume()
    })
    await expect.poll(() => stub.vibrateSpy.mock.calls.length, { timeout: 2000 })
      .toBeGreaterThanOrEqual(2)

    await act(() => {
      result.current.stop()
    })
    expect(stub.vibrateSpy).toHaveBeenLastCalledWith(0)
    expect(result.current.intervalControls.isActive).toBe(false)

    // stop() cancels the pending interval
    const callsAfterStop = stub.vibrateSpy.mock.calls.length
    await new Promise(resolve => setTimeout(resolve, 300))
    expect(stub.vibrateSpy.mock.calls.length).toBe(callsAfterStop)

    unmount()
  }
  finally {
    stub.restore()
  }
})

it('useVibrate restarts the interval loop when the interval option changes', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result, act, rerender, unmount } = await renderHook(
      ({ interval = 100 }: { interval?: number } = { interval: 100 }) => useVibrate({ pattern: 300, interval }),
      { initialProps: { interval: 100 } },
    )
    await act(() => {
      result.current.intervalControls.resume()
    })
    await expect.poll(() => stub.vibrateSpy.mock.calls.length, { timeout: 2000 })
      .toBeGreaterThanOrEqual(2)

    // slow the loop down: the 100 ms cadence must stop, the loop restarts
    // (rerender is act-wrapped internally — never nest it inside act())
    await rerender({ interval: 1000 })
    const callsAfterRestart = stub.vibrateSpy.mock.calls.length
    await new Promise(resolve => setTimeout(resolve, 300))
    expect(stub.vibrateSpy.mock.calls.length).toBe(callsAfterRestart)

    // and the slower loop still fires within its new period
    await expect.poll(() => stub.vibrateSpy.mock.calls.length, { timeout: 3000 })
      .toBeGreaterThan(callsAfterRestart)

    unmount()
  }
  finally {
    stub.restore()
  }
})

it('useVibrate clears the interval loop on unmount', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result, act, unmount } = await renderHook(() => useVibrate({ pattern: 300, interval: 100 }))
    await act(() => {
      result.current.intervalControls.resume()
    })
    await expect.poll(() => stub.vibrateSpy.mock.calls.length, { timeout: 2000 })
      .toBeGreaterThanOrEqual(2)

    unmount()
    const callsAfterUnmount = stub.vibrateSpy.mock.calls.length
    await new Promise(resolve => setTimeout(resolve, 300))
    expect(stub.vibrateSpy.mock.calls.length).toBe(callsAfterUnmount)
  }
  finally {
    stub.restore()
  }
})
