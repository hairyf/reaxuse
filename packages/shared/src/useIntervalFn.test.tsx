import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useIntervalFn } from './useIntervalFn'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it('useIntervalFn basic pause/resume', async () => {
  const callback = vi.fn()
  const { result, act, unmount } = await renderHook(() => useIntervalFn(callback, 50))

  expect(result.current.isActive).toBeTruthy()
  expect(callback).toHaveBeenCalledTimes(0)

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(1)

  await act(() => {
    result.current.pause()
  })
  expect(result.current.isActive).toBeFalsy()

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(1)

  await act(() => {
    result.current.resume()
  })
  expect(result.current.isActive).toBeTruthy()

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(2)

  await unmount()
})

it('useIntervalFn basic pause/resume with a reactive interval', async () => {
  const callback = vi.fn()
  const { result, rerender, act, unmount } = await renderHook(
    ({ interval }: { interval: number } = { interval: 50 }) => useIntervalFn(callback, interval),
    { initialProps: { interval: 50 } },
  )

  expect(result.current.isActive).toBeTruthy()
  expect(callback).toHaveBeenCalledTimes(0)

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(1)

  await act(() => {
    result.current.pause()
  })
  expect(result.current.isActive).toBeFalsy()

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(1)

  await act(() => {
    result.current.resume()
  })
  expect(result.current.isActive).toBeTruthy()

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(2)

  // changing the interval while active restarts the timer with the new value
  callback.mockClear()
  await rerender({ interval: 20 })
  await act(() => {
    vi.advanceTimersByTime(30)
  })
  expect(callback).toHaveBeenCalledTimes(1)

  // while paused, a changed interval is picked up on resume
  await act(() => {
    result.current.pause()
  })
  callback.mockClear()
  await rerender({ interval: 10 })
  await act(() => {
    vi.advanceTimersByTime(15)
  })
  expect(callback).not.toBeCalled()

  await act(() => {
    result.current.resume()
  })
  await act(() => {
    vi.advanceTimersByTime(15)
  })
  expect(callback).toHaveBeenCalledTimes(1)

  await unmount()
})

it('useIntervalFn pause/resume with immediateCallback', async () => {
  const callback = vi.fn()
  const { result, act, unmount } = await renderHook(
    () => useIntervalFn(callback, 50, { immediateCallback: true }),
  )

  expect(result.current.isActive).toBeTruthy()
  expect(callback).toHaveBeenCalledTimes(1)

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(2)

  await act(() => {
    result.current.pause()
  })
  expect(result.current.isActive).toBeFalsy()

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(2)

  await act(() => {
    result.current.resume()
  })
  expect(result.current.isActive).toBeTruthy()
  expect(callback).toHaveBeenCalledTimes(3)

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(4)

  await unmount()
})

it('useIntervalFn pause/resume with immediateCallback and a reactive interval', async () => {
  const callback = vi.fn()
  const { result, rerender, act, unmount } = await renderHook(
    ({ interval }: { interval: number } = { interval: 50 }) =>
      useIntervalFn(callback, interval, { immediateCallback: true }),
    { initialProps: { interval: 50 } },
  )

  expect(result.current.isActive).toBeTruthy()
  expect(callback).toHaveBeenCalledTimes(1)

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(2)

  await act(() => {
    result.current.pause()
  })
  expect(result.current.isActive).toBeFalsy()

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(2)

  await act(() => {
    result.current.resume()
  })
  expect(result.current.isActive).toBeTruthy()
  expect(callback).toHaveBeenCalledTimes(3)

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(4)

  // changing the interval while active resumes with the new value, firing the
  // callback immediately again
  callback.mockClear()
  await rerender({ interval: 20 })
  expect(callback).toHaveBeenCalledTimes(1)

  await unmount()
})

it('useIntervalFn stops the timer on unmount', async () => {
  const callback = vi.fn()
  const { result, act, unmount } = await renderHook(() => useIntervalFn(callback, 50))

  expect(result.current.isActive).toBeTruthy()
  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(1)

  await unmount()

  vi.advanceTimersByTime(60)
  expect(callback).toHaveBeenCalledTimes(1)
})

it('useIntervalFn pause in callback', async () => {
  const callback = vi.fn()
  const { result, act, unmount } = await renderHook(
    () =>
      useIntervalFn(() => {
        callback()
        result.current.pause()
      }, 50, { immediateCallback: true, immediate: false }),
  )

  await act(() => {
    result.current.resume()
  })
  expect(result.current.isActive).toBeFalsy()
  expect(callback).toHaveBeenCalledTimes(1)

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(1)

  await act(() => {
    result.current.resume()
  })
  expect(result.current.isActive).toBeFalsy()
  expect(callback).toHaveBeenCalledTimes(2)

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(2)

  await unmount()
})

it('useIntervalFn cant work when interval is negative', async () => {
  const callback = vi.fn()
  const { result, unmount } = await renderHook(() => useIntervalFn(callback, -1))

  expect(result.current.isActive).toBeFalsy()
  vi.advanceTimersByTime(60)
  expect(callback).not.toBeCalled()

  await unmount()
})

it('useIntervalFn does not start when immediate is false', async () => {
  const callback = vi.fn()
  const { result, act, unmount } = await renderHook(
    () => useIntervalFn(callback, 50, { immediate: false }),
  )

  expect(result.current.isActive).toBeFalsy()
  expect(callback).not.toBeCalled()

  await act(() => {
    result.current.resume()
  })
  expect(result.current.isActive).toBeTruthy()
  expect(callback).not.toBeCalled()

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(callback).toHaveBeenCalledTimes(1)

  await unmount()
})

it('useIntervalFn fires the newest callback on every tick', async () => {
  const first = vi.fn()
  const newer = vi.fn()
  const { rerender, act, unmount } = await renderHook(
    ({ cb }: { cb: () => void } = { cb: first }) => useIntervalFn(cb, 50),
    { initialProps: { cb: first } },
  )

  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(first).toHaveBeenCalledTimes(1)

  // swapping the callback does not restart the timer, but the next tick
  // invokes the newest one
  await rerender({ cb: newer })
  await act(() => {
    vi.advanceTimersByTime(60)
  })
  expect(first).toHaveBeenCalledTimes(1)
  expect(newer).toHaveBeenCalledTimes(1)

  await unmount()
})
