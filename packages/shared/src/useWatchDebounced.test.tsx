import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useWatchDebounced } from './useWatchDebounced'

interface WatchCall {
  value: number
  oldValue: number | undefined
}

describe('useWatchDebounced', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires with the latest (value, oldValue) right after a change by default', async () => {
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchDebounced(value, (next, prev) => calls.push({ value: next, oldValue: prev }))
    })

    expect(calls).toEqual([])

    await act(() => setValue(1))
    expect(calls).toEqual([{ value: 1, oldValue: 0 }])
  })

  it('debounces changes and forces the call when maxWait elapses', async () => {
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchDebounced(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { debounce: 100, maxWait: 150 })
    })

    await act(() => setValue(1))
    expect(calls).toEqual([])

    await act(() => setValue(2))
    await act(async () => {
      vi.advanceTimersByTime(50)
    })
    expect(calls).toEqual([])

    await act(async () => {
      vi.advanceTimersByTime(50)
    })
    expect(calls).toEqual([{ value: 2, oldValue: 1 }])

    await act(() => setValue(4))
    await act(async () => {
      vi.advanceTimersByTime(80)
    })
    expect(calls).toEqual([{ value: 2, oldValue: 1 }])

    await act(() => setValue(5))
    await act(async () => {
      vi.advanceTimersByTime(75)
    })
    expect(calls).toEqual([{ value: 2, oldValue: 1 }, { value: 5, oldValue: 4 }])
  })

  it('fires with the latest value over multiple maxWaits under constant changes', async () => {
    const calls: number[] = []
    let setValue: (value: number) => void = () => {}
    let counter = 0

    const { act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchDebounced(value, next => calls.push(next), { debounce: 10, maxWait: 50 })
    })

    // each iteration: change the source at the current fake time, then
    // advance 1ms — mirroring upstream's `num.value += 1; advance(1)` loop
    const constantUpdateOverTime = async (ms: number) => {
      for (let i = 0; i < ms; i++) {
        counter += 1
        await act(() => setValue(counter))
        await act(async () => {
          vi.advanceTimersByTime(1)
        })
      }
    }

    expect(calls).toEqual([])

    await constantUpdateOverTime(49)
    expect(calls).toEqual([])

    await constantUpdateOverTime(1)
    expect(calls).toEqual([50])

    await constantUpdateOverTime(50)
    expect(calls).toEqual([50, 100])

    await constantUpdateOverTime(50)
    expect(calls).toEqual([50, 100, 150])
  })

  it('collapses a rapid burst of changes into a single trailing call', async () => {
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchDebounced(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { debounce: 100 })
    })

    await act(() => setValue(1))
    await act(() => setValue(2))
    await act(() => setValue(3))
    expect(calls).toEqual([])

    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(calls).toEqual([{ value: 3, oldValue: 2 }])

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(calls).toEqual([{ value: 3, oldValue: 2 }])
  })

  it('fires debounced on mount with immediate: true', async () => {
    const calls: WatchCall[] = []
    let setValue: (value: number) => void = () => {}

    const { act } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchDebounced(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { debounce: 100, immediate: true })
    })

    expect(calls).toEqual([])

    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(calls).toEqual([{ value: 0, oldValue: undefined }])

    await act(() => setValue(5))
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(calls).toEqual([{ value: 0, oldValue: undefined }, { value: 5, oldValue: 0 }])
  })

  it('clears the pending callback on unmount', async () => {
    const calls: number[] = []
    let setValue: (value: number) => void = () => {}

    const { act, unmount } = await renderHook(() => {
      const [value, update] = useState(0)
      setValue = update
      useWatchDebounced(value, next => calls.push(next), { debounce: 100 })
    })

    await act(() => setValue(1))
    await unmount()

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(calls).toEqual([])
  })
})

describe('useWatchDebounced (component)', () => {
  function UseWatchDebouncedDemo() {
    const [count, setCount] = useState(0)
    const [unrelated, setUnrelated] = useState(0)
    const [updates, setUpdates] = useState(0)

    useWatchDebounced(count, () => setUpdates(v => v + 1), { debounce: 500 })

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

  it('ignores unrelated re-renders and collapses rapid changes into one debounced update', async () => {
    const screen = await render(<UseWatchDebouncedDemo />)
    const increment = screen.getByRole('button', { name: 'increment' })

    await increment.click()
    await increment.click()
    // an unrelated state change re-renders but must not disturb the pending
    // debounce nor fire the callback (the watched source did not change)
    await screen.getByRole('button', { name: 'bump-unrelated' }).click()
    await increment.click()

    await expect.element(screen.getByText('Count: 3')).toBeVisible()
    await expect.element(screen.getByText('Unrelated: 1')).toBeVisible()
    await expect.element(screen.getByText('Updates: 1')).toBeVisible()
  })
})
