import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useWatchThrottled } from './useWatchThrottled'

interface WatchCall {
  value: number
  oldValue: number | undefined
}

describe('useWatchThrottled', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires on the leading edge and collapses in-window changes into a trailing call', async () => {
    // mirrors upstream `should work` (throttle: 100)
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchThrottled(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { throttle: 100 })
    })

    // the first change fires immediately on the leading edge
    await act(() => setValue(1))
    expect(calls).toEqual([{ value: 1, oldValue: 0 }])

    // a change inside the window schedules a trailing call
    await act(() => setValue(2))
    await act(async () => {
      vi.advanceTimersByTime(50)
    })
    expect(calls).toEqual([{ value: 1, oldValue: 0 }])

    // re-scheduling inside the window keeps collapsing into one trailing call
    await act(() => setValue(3))
    await act(async () => {
      vi.advanceTimersByTime(50)
    })
    expect(calls).toEqual([
      { value: 1, oldValue: 0 },
      { value: 3, oldValue: 2 },
    ])

    await act(() => setValue(4))
    await act(async () => {
      vi.advanceTimersByTime(110)
    })
    expect(calls).toEqual([
      { value: 1, oldValue: 0 },
      { value: 3, oldValue: 2 },
      { value: 4, oldValue: 3 },
    ])
  })

  it('invokes only at the end of the window with leading: false', async () => {
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchThrottled(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { throttle: 100, leading: false })
    })

    await act(() => setValue(1))
    await act(() => setValue(2))
    await act(() => setValue(3))
    expect(calls).toEqual([])

    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(calls).toEqual([{ value: 3, oldValue: 2 }])
  })

  it('invokes only at the start of the window with trailing: false', async () => {
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchThrottled(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { throttle: 100, trailing: false })
    })

    await act(() => setValue(1))
    expect(calls).toEqual([{ value: 1, oldValue: 0 }])

    await act(() => setValue(2))
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(calls).toEqual([{ value: 1, oldValue: 0 }])

    // still inside the window (elapsed === duration) — no leading invoke yet
    await act(() => setValue(3))
    expect(calls).toEqual([{ value: 1, oldValue: 0 }])

    await act(async () => {
      vi.advanceTimersByTime(50)
    })
    await act(() => setValue(4))
    expect(calls).toEqual([
      { value: 1, oldValue: 0 },
      { value: 4, oldValue: 3 },
    ])
  })

  it('fires throttled on mount with immediate: true', async () => {
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchThrottled(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { throttle: 100, immediate: true })
    })

    // the mount call passes through the throttle filter — leading edge fires
    expect(calls).toEqual([{ value: 0, oldValue: undefined }])

    await act(() => setValue(1))
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(calls).toEqual([
      { value: 0, oldValue: undefined },
      { value: 1, oldValue: 0 },
    ])
  })

  it('clears the pending callback on unmount', async () => {
    const calls: number[] = []
    let setValue: (value: number) => void = () => {}

    const { act, unmount } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchThrottled(value, next => calls.push(next), { throttle: 100 })
    })

    await act(() => setValue(1))
    expect(calls).toEqual([1])

    await act(() => setValue(2))
    await unmount()

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(calls).toEqual([1])
  })
})

describe('useWatchThrottled (component)', () => {
  function UseWatchThrottledDemo() {
    const [count, setCount] = useState(0)
    const [unrelated, setUnrelated] = useState(0)
    const [updates, setUpdates] = useState(0)

    useWatchThrottled(count, () => setUpdates(v => v + 1), { throttle: 500 })

    return (
      <div>
        <button onClick={() => setCount(count + 1)}>increment</button>
        <button onClick={() => setUnrelated(unrelated + 1)}>bump-unrelated</button>
        <p>
          Count:
          {' '}
          {count}
        </p>
        <p>
          Unrelated:
          {' '}
          {unrelated}
        </p>
        <p>
          Updates:
          {' '}
          {updates}
        </p>
      </div>
    )
  }

  it('ignores unrelated re-renders and splits a burst into leading + trailing updates', async () => {
    const screen = await render(<UseWatchThrottledDemo />)
    const increment = screen.getByRole('button', { name: 'increment' })

    await increment.click()
    await increment.click()
    // an unrelated state change re-renders but must not disturb the pending
    // throttle window nor fire the callback (the watched source did not change)
    await screen.getByRole('button', { name: 'bump-unrelated' }).click()
    await increment.click()

    await expect.element(screen.getByText('Count: 3')).toBeVisible()
    await expect.element(screen.getByText('Unrelated: 1')).toBeVisible()
    // leading edge fires on the first click, the burst's latest value lands on
    // the trailing edge — one throttle window, two calls
    await expect.element(screen.getByText('Updates: 2')).toBeVisible()
  })
})
