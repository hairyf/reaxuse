import type { Pausable } from '../useTimeoutPoll'
import { useIntervalFn } from '@reause/shared'
import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useNow } from '../useNow'
import { useRafFn } from '../useRafFn'

// test schedulers mirroring upstream's
// `testControl('requestAnimationFrame', cb => useRafFn(cb))` and
// `testControl('interval', cb => useIntervalFn(cb, 50))`
function useTestIntervalScheduler(cb: () => void): Pausable {
  return useIntervalFn(cb, 50)
}

function useLazyRafScheduler(cb: () => void): Pausable {
  return useRafFn(cb, { immediate: false })
}

it('useNow gets the current date by default (upstream "should get now timestamp by default")', async () => {
  const before = Date.now()
  const { result } = await renderHook(() => useNow())

  expect(result.current).toBeInstanceOf(Date)
  expect(result.current.getTime()).toBeLessThanOrEqual(Date.now())
  expect(result.current.getTime()).toBeGreaterThanOrEqual(before)
})

it('useNow updates on every animation frame by default', async () => {
  const { result } = await renderHook(() => useNow())
  const first = result.current.getTime()

  await expect
    .poll(() => result.current.getTime(), { interval: 50, timeout: 2000 })
    .toBeGreaterThan(first)
})

it('useNow pauses and resumes the requestAnimationFrame scheduler (upstream "should control now timestamp by requestAnimationFrame")', async () => {
  const { result, act } = await renderHook(() => useNow({ controls: true }))

  expect(result.current.isActive).toBe(true)
  expect(result.current.now).toBeInstanceOf(Date)

  const first = result.current.now.getTime()
  await expect
    .poll(() => result.current.now.getTime(), { interval: 50, timeout: 2000 })
    .toBeGreaterThan(first)

  await act(async () => {
    result.current.pause()
  })
  expect(result.current.isActive).toBe(false)

  const frozen = result.current.now.getTime()
  await new Promise(resolve => setTimeout(resolve, 150))
  expect(result.current.now.getTime()).toBe(frozen)

  await act(async () => {
    result.current.resume()
  })
  expect(result.current.isActive).toBe(true)

  await expect
    .poll(() => result.current.now.getTime(), { interval: 50, timeout: 2000 })
    .toBeGreaterThan(frozen)
})

it('useNow pauses and resumes a custom interval scheduler (upstream "should control now timestamp by interval")', async () => {
  const { result, act } = await renderHook(() => useNow({ controls: true, scheduler: useTestIntervalScheduler }))

  const first = result.current.now.getTime()
  await expect
    .poll(() => result.current.now.getTime(), { interval: 20, timeout: 2000 })
    .toBeGreaterThan(first)

  await act(async () => {
    result.current.pause()
  })
  expect(result.current.isActive).toBe(false)

  const frozen = result.current.now.getTime()
  await new Promise(resolve => setTimeout(resolve, 150))
  expect(result.current.now.getTime()).toBe(frozen)

  await act(async () => {
    result.current.resume()
  })
  expect(result.current.isActive).toBe(true)

  await expect
    .poll(() => result.current.now.getTime(), { interval: 20, timeout: 2000 })
    .toBeGreaterThan(frozen)
})

it('useNow starts lazily if the scheduler is not immediate (upstream "starts lazily if the scheduler is not immediate")', async () => {
  const { result, act } = await renderHook(() => useNow({
    controls: true,
    scheduler: useLazyRafScheduler,
  }))

  const initial = result.current.now.getTime()
  await new Promise(resolve => setTimeout(resolve, 150))
  expect(result.current.now.getTime()).toBe(initial)

  await act(async () => {
    result.current.resume()
  })

  await expect
    .poll(() => result.current.now.getTime(), { interval: 50, timeout: 2000 })
    .toBeGreaterThan(initial)
})

it('useNow stops updating after unmount', async () => {
  const { result, unmount } = await renderHook(() => useNow())
  const value = result.current.getTime()
  unmount()

  await new Promise(resolve => setTimeout(resolve, 150))
  expect(result.current.getTime()).toBe(value)
})
