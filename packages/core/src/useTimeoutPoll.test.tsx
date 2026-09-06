import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useTimeoutPoll } from './useTimeoutPoll'

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

it('useTimeoutPoll auto-starts and polls once per interval', async () => {
  let calls = 0
  const { result } = await renderHook(() => useTimeoutPoll(() => {
    calls += 1
  }, 50))

  expect(result.current.isActive).toBe(true)
  // the first run is scheduled one interval after activation, not synchronously
  expect(calls).toBe(0)

  await expect
    .poll(() => calls, { interval: 20, timeout: 2000 })
    .toBeGreaterThanOrEqual(3)
})

it('useTimeoutPoll waits for the previous async run before scheduling the next', async () => {
  let calls = 0
  let running = 0
  let maxConcurrent = 0
  const { unmount } = await renderHook(() => useTimeoutPoll(async () => {
    running += 1
    maxConcurrent = Math.max(maxConcurrent, running)
    await sleep(80)
    running -= 1
    calls += 1
  }, 20))

  await expect
    .poll(() => calls, { interval: 20, timeout: 2000 })
    .toBeGreaterThanOrEqual(2)

  // async callbacks are awaited — two runs never overlap
  expect(maxConcurrent).toBe(1)

  unmount()
})

it('useTimeoutPoll stops polling while paused', async () => {
  let calls = 0
  const { result, act } = await renderHook(() => useTimeoutPoll(() => {
    calls += 1
  }, 50))

  await expect
    .poll(() => calls, { interval: 20, timeout: 2000 })
    .toBeGreaterThanOrEqual(1)

  await act(async () => {
    result.current.pause()
  })
  expect(result.current.isActive).toBe(false)

  const count = calls
  await sleep(150)
  expect(calls).toBe(count)
})

it('useTimeoutPoll resumes with the next run one interval later', async () => {
  let calls = 0
  const { result, act } = await renderHook(() => useTimeoutPoll(() => {
    calls += 1
  }, 50))

  await expect
    .poll(() => calls, { interval: 20, timeout: 2000 })
    .toBeGreaterThanOrEqual(1)

  await act(async () => {
    result.current.pause()
  })
  const count = calls

  await act(async () => {
    result.current.resume()
  })
  expect(result.current.isActive).toBe(true)
  // upstream does not fire the callback synchronously on `resume` — the next
  // run is one interval away
  expect(calls).toBe(count)

  await expect
    .poll(() => calls, { interval: 20, timeout: 2000 })
    .toBeGreaterThan(count)
})

it('useTimeoutPoll with immediate: false stays inactive until resume', async () => {
  let calls = 0
  const { result, act } = await renderHook(() => useTimeoutPoll(() => {
    calls += 1
  }, 50, { immediate: false }))

  expect(result.current.isActive).toBe(false)
  await sleep(150)
  expect(calls).toBe(0)

  await act(async () => {
    result.current.resume()
  })
  expect(result.current.isActive).toBe(true)

  await expect
    .poll(() => calls, { interval: 20, timeout: 2000 })
    .toBeGreaterThanOrEqual(1)
})

it('useTimeoutPoll fires the callback immediately on activation with immediateCallback', async () => {
  let calls = 0
  const { result } = await renderHook(() => useTimeoutPoll(() => {
    calls += 1
  }, 50, { immediateCallback: true }))

  // fired synchronously by the auto `resume()` in the mount effect
  expect(calls).toBe(1)
  expect(result.current.isActive).toBe(true)

  await expect
    .poll(() => calls, { interval: 20, timeout: 2000 })
    .toBeGreaterThanOrEqual(2)
})

it('useTimeoutPoll re-arms the pending run when the interval changes', async () => {
  let calls = 0
  const { rerender } = await renderHook(
    (props?: { interval: number }) => useTimeoutPoll(() => {
      calls += 1
    }, props?.interval ?? 50),
    { initialProps: { interval: 50 } },
  )

  await expect
    .poll(() => calls, { interval: 20, timeout: 2000 })
    .toBeGreaterThanOrEqual(1)

  // rerender is already act-wrapped; the pending 50ms run is re-armed to 500ms
  rerender({ interval: 500 })
  const count = calls
  await sleep(150)
  expect(calls).toBe(count)

  rerender({ interval: 50 })
  await expect
    .poll(() => calls, { interval: 20, timeout: 2000 })
    .toBeGreaterThan(count)
})

it('useTimeoutPoll stops polling after unmount', async () => {
  let calls = 0
  const { unmount } = await renderHook(() => useTimeoutPoll(() => {
    calls += 1
  }, 50))

  await expect
    .poll(() => calls, { interval: 20, timeout: 2000 })
    .toBeGreaterThanOrEqual(1)

  unmount()
  const count = calls
  await sleep(150)
  expect(calls).toBe(count)
})
