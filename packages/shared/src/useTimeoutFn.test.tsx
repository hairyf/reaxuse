import { useState } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useTimeoutFn } from './useTimeoutFn'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it('useTimeoutFn starts immediately by default and toggles isPending', async () => {
  const callback = vi.fn()
  const { result, act, unmount } = await renderHook(() => useTimeoutFn(callback, 0))

  // immediate start: pending right after mount, callback not yet fired
  expect(result.current.isPending).toBe(true)
  expect(callback).not.toBeCalled()

  await act(() => {
    vi.advanceTimersByTime(1)
  })

  expect(callback).toBeCalledTimes(1)
  expect(result.current.isPending).toBe(false)

  await unmount()
})

it('useTimeoutFn stop() cancels a pending timer', async () => {
  const callback = vi.fn()
  const { result, act, unmount } = await renderHook(() => useTimeoutFn(callback, 100))

  expect(result.current.isPending).toBe(true)

  await act(() => {
    result.current.stop()
  })

  expect(result.current.isPending).toBe(false)

  await act(() => {
    vi.advanceTimersByTime(200)
  })

  expect(callback).not.toBeCalled()

  await unmount()
})

it('useTimeoutFn start() (re)starts the timer with the newest callback', async () => {
  const callback = vi.fn()
  const newer = vi.fn()
  const { result, rerender, act, unmount } = await renderHook(
    ({ fn, interval }: { fn: () => void, interval: number } = { fn: callback, interval: 0 }) =>
      useTimeoutFn(fn, interval),
    { initialProps: { fn: callback, interval: 0 } },
  )

  await act(() => {
    vi.advanceTimersByTime(1)
  })
  expect(callback).toBeCalledTimes(1)

  // restart with a longer interval and a newer callback
  await rerender({ fn: newer, interval: 50 })
  await act(() => {
    result.current.start()
  })

  await act(() => {
    vi.advanceTimersByTime(1)
  })
  expect(newer).not.toBeCalled()
  expect(callback).toBeCalledTimes(1)

  await act(() => {
    vi.advanceTimersByTime(100)
  })
  expect(newer).toBeCalledTimes(1)

  await unmount()
})

it('useTimeoutFn does not start when immediate is false', async () => {
  const callback = vi.fn()
  const { result, act, unmount } = await renderHook(
    () => useTimeoutFn(callback, 0, { immediate: false }),
  )

  expect(result.current.isPending).toBe(false)
  expect(callback).not.toBeCalled()

  await act(() => {
    result.current.start()
  })

  expect(result.current.isPending).toBe(true)
  expect(callback).not.toBeCalled()

  await act(() => {
    vi.advanceTimersByTime(1)
  })

  expect(result.current.isPending).toBe(false)
  expect(callback).toBeCalledTimes(1)

  await unmount()
})

it('useTimeoutFn clears a pending timer on unmount', async () => {
  const callback = vi.fn()
  const { result, unmount } = await renderHook(() => useTimeoutFn(callback, 100))

  expect(result.current.isPending).toBe(true)

  await unmount()

  vi.advanceTimersByTime(200)
  expect(callback).not.toBeCalled()
})

it('useTimeoutFn fires a delayed message in a component', async () => {
  vi.useRealTimers()

  function TimeoutDemo() {
    const [text, setText] = useState('Please wait for 1 second')
    const { isPending, start } = useTimeoutFn(() => setText('Fired!'), 20, { immediate: false })

    return (
      <div>
        <p>{isPending ? 'pending' : text}</p>
        <button onClick={start}>Start</button>
      </div>
    )
  }

  const screen = await render(<TimeoutDemo />)
  await expect.element(screen.getByText('Please wait for 1 second')).toBeVisible()

  await screen.getByRole('button', { name: 'Start' }).click()
  await expect.element(screen.getByText('pending')).toBeVisible()
  await expect.element(screen.getByText('Fired!')).toBeVisible()
})
