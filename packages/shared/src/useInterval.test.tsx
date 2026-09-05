import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useInterval } from './useInterval'

describe('useInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('increments the counter on every interval (starts automatically)', async () => {
    const { result, act } = await renderHook(() => useInterval(10))
    expect(result.current).toBe(0)

    await act(async () => {
      vi.advanceTimersByTime(30)
    })
    expect(result.current).toBe(3)
  })

  it('exposes counter/isActive with controls', async () => {
    const { result, act } = await renderHook(() => useInterval(10, { controls: true }))
    expect(result.current.counter).toBe(0)
    expect(result.current.isActive).toBe(true)

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.counter).toBe(1)
    expect(result.current.isActive).toBe(true)
  })

  it('pause() stops the counter and resume() restarts it', async () => {
    const { result, act } = await renderHook(() => useInterval(10, { controls: true }))

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.counter).toBe(1)

    await act(async () => {
      result.current.pause()
    })
    expect(result.current.isActive).toBe(false)

    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.counter).toBe(1)

    await act(async () => {
      result.current.resume()
    })
    expect(result.current.isActive).toBe(true)

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.counter).toBe(2)
  })

  it('reset() zeroes the counter without stopping the interval', async () => {
    const { result, act } = await renderHook(() => useInterval(10, { controls: true }))

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.counter).toBe(1)

    await act(async () => {
      result.current.reset()
    })
    expect(result.current.counter).toBe(0)
    expect(result.current.isActive).toBe(true)

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.counter).toBe(1)
  })

  it('accepts a getter interval (upstream: ref target)', async () => {
    const { result, act } = await renderHook(() => useInterval(() => 10))
    expect(result.current).toBe(0)

    await act(async () => {
      vi.advanceTimersByTime(20)
    })
    expect(result.current).toBe(2)
  })

  it('passes the incremented count to the callback', async () => {
    const calls: number[] = []
    const { act } = await renderHook(() => useInterval(10, { callback: count => calls.push(count) }))

    await act(async () => {
      vi.advanceTimersByTime(20)
    })
    expect(calls).toEqual([1, 2])
  })

  it('immediateCallback increments right when the interval starts', async () => {
    const calls: number[] = []
    const { result, act } = await renderHook(() =>
      useInterval(10, { controls: true, immediateCallback: true, callback: count => calls.push(count) }))

    expect(result.current.counter).toBe(1)
    expect(calls).toEqual([1])
    expect(result.current.isActive).toBe(true)

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.counter).toBe(2)
  })

  it('immediate: false does not start automatically', async () => {
    const { result, act } = await renderHook(() => useInterval(10, { controls: true, immediate: false }))

    expect(result.current.counter).toBe(0)
    expect(result.current.isActive).toBe(false)

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.counter).toBe(0)

    await act(async () => {
      result.current.resume()
    })
    expect(result.current.isActive).toBe(true)

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.counter).toBe(1)
  })

  it('never starts when the interval is 0 (upstream resume guard)', async () => {
    const { result, act } = await renderHook(() => useInterval(0, { controls: true }))
    expect(result.current.isActive).toBe(false)

    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.counter).toBe(0)
  })

  it('re-evaluates a getter interval on resume()', async () => {
    let ms = 10
    const { result, act } = await renderHook(() => useInterval(() => ms, { controls: true }))

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.counter).toBe(1)

    await act(async () => {
      result.current.pause()
    })
    ms = 20
    await act(async () => {
      result.current.resume()
    })

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.counter).toBe(1)

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(result.current.counter).toBe(2)
  })

  it('stops the timer on unmount', async () => {
    const calls: number[] = []
    const { act, unmount } = await renderHook(() => useInterval(10, { callback: count => calls.push(count) }))

    await act(async () => {
      vi.advanceTimersByTime(10)
    })
    expect(calls).toEqual([1])

    await unmount()
    vi.advanceTimersByTime(100)
    expect(calls).toEqual([1])
  })
})

describe('useInterval (component)', () => {
  function UseIntervalDemo() {
    const { counter, isActive, pause, resume } = useInterval(250, { controls: true })
    return (
      <div>
        <span>
          {'Count is '}
          {counter}
        </span>
        <button onClick={() => (isActive ? pause() : resume())}>{isActive ? 'Pause' : 'Resume'}</button>
      </div>
    )
  }

  it('counts up and toggles pause/resume', async () => {
    const screen = await render(<UseIntervalDemo />)

    await expect.element(screen.getByText('Count is 1')).toBeVisible()

    await screen.getByRole('button', { name: 'Pause' }).click()
    await expect.element(screen.getByRole('button', { name: 'Resume' })).toBeVisible()

    await screen.getByRole('button', { name: 'Resume' }).click()
    await expect.element(screen.getByRole('button', { name: 'Pause' })).toBeVisible()
  })
})
