import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useTimestamp } from './useTimestamp'

it('useTimestamp starts with a timestamp near Date.now()', async () => {
  const before = Date.now()
  const { result } = await renderHook(() => useTimestamp())

  expect(result.current).toBeGreaterThanOrEqual(before)
  expect(result.current).toBeLessThanOrEqual(Date.now() + 100)
})

it('useTimestamp applies the offset option', async () => {
  const { result } = await renderHook(() => useTimestamp({ offset: 5000 }))

  expect(result.current).toBeGreaterThanOrEqual(Date.now() + 4900)
  expect(result.current).toBeLessThanOrEqual(Date.now() + 5100)
})

it('useTimestamp advances over time (rAF-driven)', async () => {
  const { result } = await renderHook(() => useTimestamp())
  const first = result.current

  await expect
    .poll(() => result.current, { interval: 50, timeout: 2000 })
    .toBeGreaterThan(first)
})

it('useTimestamp calls the callback on each update', async () => {
  const calls: number[] = []
  const { unmount } = await renderHook(() => useTimestamp({
    callback: (ts) => {
      calls.push(ts)
    },
  }))

  await expect
    .poll(() => calls.length, { interval: 50, timeout: 2000 })
    .toBeGreaterThan(0)

  unmount()
  const count = calls.length

  await new Promise(resolve => setTimeout(resolve, 150))
  expect(calls.length).toBe(count)
})

it('useTimestamp controls pause and resume the updates', async () => {
  const { result, act } = await renderHook(() => useTimestamp({ controls: true }))

  expect(result.current.isActive).toBe(true)

  await act(async () => {
    result.current.pause()
  })
  expect(result.current.isActive).toBe(false)

  const frozen = result.current.timestamp
  await new Promise(resolve => setTimeout(resolve, 150))
  expect(result.current.timestamp).toBe(frozen)

  await act(async () => {
    result.current.resume()
  })
  expect(result.current.isActive).toBe(true)

  await expect
    .poll(() => result.current.timestamp, { interval: 50, timeout: 2000 })
    .toBeGreaterThan(frozen)
})

it('useTimestamp stops updating after unmount', async () => {
  const { result, unmount } = await renderHook(() => useTimestamp())
  const value = result.current
  unmount()

  await new Promise(resolve => setTimeout(resolve, 150))
  expect(result.current).toBe(value)
})
