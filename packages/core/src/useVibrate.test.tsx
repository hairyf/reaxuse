import { expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useVibrate } from './useVibrate'

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
  const stub = stubNavigatorVibrate()
  try {
    // A custom navigator without `vibrate` simulates an unsupported browser
    // deterministically (the real browser may expose `vibrate` itself).
    const { result } = await renderHook(() => useVibrate({ navigator: {} as Navigator }))
    expect(result.current.isSupported).toBe(false)
  }
  finally {
    stub.restore()
  }
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
  const stub = stubNavigatorVibrate()
  try {
    // The unsupported custom navigator must gate every call — the stubbed
    // global navigator must never be reached.
    const { result, act } = await renderHook(() => useVibrate({ navigator: {} as Navigator }))
    expect(result.current.isSupported).toBe(false)

    await act(() => {
      result.current.vibrate(100)
      result.current.stop()
    })
    expect(stub.vibrateSpy).not.toHaveBeenCalled()
  }
  finally {
    stub.restore()
  }
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

it('useVibrate re-vibrates on the interval until stopped', async () => {
  const stub = stubNavigatorVibrate()
  try {
    const { result, act, unmount } = await renderHook(() => useVibrate({ pattern: 300, interval: 100 }))
    await act(() => {
      result.current.vibrate()
    })
    const callsAfterStart = stub.vibrateSpy.mock.calls.length

    // the loop re-triggers the pattern
    await expect.poll(() => stub.vibrateSpy.mock.calls.length, { timeout: 2000 })
      .toBeGreaterThanOrEqual(callsAfterStart + 2)

    await act(() => {
      result.current.stop()
    })
    expect(stub.vibrateSpy).toHaveBeenLastCalledWith(0)

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
      result.current.vibrate()
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
      result.current.vibrate()
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
