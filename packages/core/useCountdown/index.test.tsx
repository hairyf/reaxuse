import type { UseCountdownOptions, UseCountdownReturn } from '../useCountdown'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useCountdown } from '../useCountdown'

describe('useCountdown', () => {
  let tickCallback = vi.fn<() => void>()
  let completeCallback = vi.fn<() => void>()
  let countdown = 3
  let interval = 100
  let options: UseCountdownOptions

  beforeEach(() => {
    vi.useFakeTimers()

    tickCallback = vi.fn<() => void>()
    completeCallback = vi.fn<() => void>()
    countdown = 3
    interval = 100
    options = {
      interval,
      onComplete: completeCallback,
      onTick: tickCallback,
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  interface HookCtx {
    result: { current: UseCountdownReturn }
    act: (callback: () => unknown) => Promise<void>
  }

  // upstream starts the countdown on setup (immediate scheduler); here the
  // timer only runs after an explicit `start()`
  async function exec({ result, act }: HookCtx) {
    await act(() => result.current.start())
    expect(result.current.isActive).toBeTruthy()
    expect(completeCallback).toHaveBeenCalledTimes(0)

    await act(() => {
      vi.advanceTimersByTime(110)
    })
    expect(tickCallback).toHaveBeenCalledTimes(1)

    await act(() => result.current.pause())
    expect(result.current.isActive).toBeFalsy()

    await act(() => {
      vi.advanceTimersByTime(110)
    })
    expect(tickCallback).toHaveBeenCalledTimes(1)

    await act(() => result.current.resume())
    expect(result.current.isActive).toBeTruthy()

    await act(() => {
      vi.advanceTimersByTime(110)
    })
    expect(tickCallback).toHaveBeenCalledTimes(2)

    await act(() => {
      vi.advanceTimersByTime(110)
    })
    expect(tickCallback).toHaveBeenCalledTimes(3)
    expect(completeCallback).toHaveBeenCalledTimes(1)
  }

  it('basic start/stop', async () => {
    const { result, act, unmount } = await renderHook(() => useCountdown(countdown, options))
    expect(result.current.isActive).toBeFalsy()
    expect(completeCallback).toHaveBeenCalledTimes(0)

    await act(() => result.current.start())
    expect(result.current.isActive).toBeTruthy()
    expect(completeCallback).toHaveBeenCalledTimes(0)

    await act(() => {
      vi.advanceTimersByTime(110)
    })

    expect(tickCallback).toHaveBeenCalledTimes(1)
    expect(completeCallback).toHaveBeenCalledTimes(0)

    await act(() => result.current.stop())
    expect(result.current.isActive).toBeFalsy()
    await act(() => {
      vi.advanceTimersByTime(110)
    })

    expect(tickCallback).toHaveBeenCalledTimes(1)
    expect(result.current.remaining).toBe(countdown)

    tickCallback.mockClear()
    completeCallback.mockClear()

    await act(() => result.current.start())

    expect(result.current.isActive).toBeTruthy()
    await act(() => {
      vi.advanceTimersByTime(210)
    })

    expect(tickCallback).toHaveBeenCalledTimes(2)
    expect(completeCallback).toHaveBeenCalledTimes(0)

    expect(result.current.remaining).toBe(1)

    await act(() => {
      vi.advanceTimersByTime(110)
    })
    expect(result.current.remaining).toBe(0)
    expect(completeCallback).toHaveBeenCalledTimes(1)

    await unmount()
  })

  it('basic pause/resume', async () => {
    const { result, act, unmount } = await renderHook(() => useCountdown(countdown, options))
    await exec({ result, act })
    await unmount()
  })

  it('pause/resume in scope', async () => {
    const { result, act, unmount } = await renderHook(() => useCountdown(countdown, options))
    await exec({ result, act })
    tickCallback.mockClear()
    // unmounting disposes the hook's resources (upstream: `effectScope` stop)
    await unmount()
    vi.advanceTimersByTime(300)
    expect(tickCallback).toHaveBeenCalledTimes(0)
  })

  it('cant work when interval is negative', async () => {
    const { result, act, unmount } = await renderHook(() => useCountdown(5, { interval: -1 }))

    await act(() => result.current.start())
    expect(result.current.isActive).toBeFalsy()
    await act(() => {
      vi.advanceTimersByTime(60)
    })
    expect(tickCallback).toHaveBeenCalledTimes(0)

    await unmount()
  })

  it('initial countdown ref can be changed', async () => {
    const countdownRef: { current: number } = { current: 3 }

    const { result, act, unmount } = await renderHook(() => useCountdown(countdownRef, options))

    countdownRef.current = 2
    await act(() => result.current.start())
    await act(() => {
      vi.advanceTimersByTime(210)
    })
    expect(completeCallback).toHaveBeenCalledTimes(1)

    await unmount()
  })

  it('start can provide a custom countdown', async () => {
    const { result, act, unmount } = await renderHook(() => useCountdown(countdown, options))
    await act(() => result.current.start())
    await act(() => {
      vi.advanceTimersByTime(countdown * interval + 10)
    })
    expect(completeCallback).toHaveBeenCalledTimes(1)

    await act(() => result.current.start(1))
    await act(() => {
      vi.advanceTimersByTime(110)
    })
    expect(completeCallback).toHaveBeenCalledTimes(2)

    await act(() => result.current.start())
    await act(() => {
      vi.advanceTimersByTime(110)
    })
    expect(completeCallback).toHaveBeenCalledTimes(2)
    await act(() => {
      vi.advanceTimersByTime(countdown * interval + 10)
    })
    expect(completeCallback).toHaveBeenCalledTimes(3)

    await act(() => result.current.start(1))
    await act(() => result.current.reset())
    await act(() => {
      vi.advanceTimersByTime(110)
    })
    expect(completeCallback).toHaveBeenCalledTimes(3)

    await unmount()
  })

  it('plain-number initial countdown is pinned to the setup value', async () => {
    const { result, act, rerender, unmount } = await renderHook(
      (props?: { countdown?: number }) => useCountdown(props?.countdown ?? countdown, options),
      { initialProps: { countdown } },
    )

    // upstream's reset closes over the setup argument, so a later
    // plain-number prop change is not picked up by no-arg start()/reset()
    await rerender({ countdown: 1 })

    await act(() => result.current.reset())
    expect(result.current.remaining).toBe(countdown)

    await act(() => result.current.start())
    await act(() => {
      vi.advanceTimersByTime(2 * interval + 10)
    })
    expect(completeCallback).toHaveBeenCalledTimes(0)
    expect(result.current.remaining).toBe(1)

    await act(() => {
      vi.advanceTimersByTime(interval + 10)
    })
    expect(completeCallback).toHaveBeenCalledTimes(1)

    await unmount()
  })
})
