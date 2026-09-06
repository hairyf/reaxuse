import { expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { TransitionPresets, useTransition } from './useTransition'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

it('useTransition tweens between numbers', async () => {
  const onStarted = vi.fn()
  const onFinished = vi.fn()
  const { result, rerender } = await renderHook(
    ({ n }: { n: number } = { n: 0 }) => useTransition(n, { duration: 500, onStarted, onFinished }),
    { initialProps: { n: 0 } },
  )

  expect(result.current).toBe(0)
  expect(onStarted).not.toHaveBeenCalled()

  await rerender({ n: 100 })

  await expect
    .poll(() => result.current, { interval: 10, timeout: 200 })
    .toBeGreaterThan(0)

  expect(onStarted).toHaveBeenCalledTimes(1)
  expect(onFinished).not.toHaveBeenCalled()
  expect(result.current).toBeLessThan(100)

  await expect
    .poll(() => result.current, { interval: 25, timeout: 2000 })
    .toBe(100)

  expect(onStarted).toHaveBeenCalledTimes(1)
  expect(onFinished).toHaveBeenCalledTimes(1)
})

it('useTransition tweens between arrays of numbers', async () => {
  const { result, rerender } = await renderHook(
    ({ v }: { v: number[] } = { v: [0] }) => useTransition(v, { duration: 500 }),
    { initialProps: { v: [0, 0] } },
  )

  expect(result.current).toEqual([0, 0])

  await rerender({ v: [100, -50] })

  await expect
    .poll(() => result.current[0], { interval: 10, timeout: 200 })
    .toBeGreaterThan(0)

  expect(result.current[0]).toBeLessThan(100)
  expect(result.current[1]).toBeLessThan(0)
  expect(result.current[1]).toBeGreaterThan(-50)

  await expect
    .poll(() => result.current, { interval: 25, timeout: 2000 })
    .toEqual([100, -50])
})

it('useTransition accepts a getter source', async () => {
  const { result, rerender } = await renderHook(
    ({ n }: { n: number } = { n: 0 }) => useTransition(() => n, { duration: 100 }),
    { initialProps: { n: 5 } },
  )

  expect(result.current).toBe(5)

  await rerender({ n: 42 })

  await expect
    .poll(() => result.current, { interval: 25, timeout: 2000 })
    .toBe(42)
})

it('useTransition supports cubic bezier curves', async () => {
  const { result, rerender } = await renderHook(
    ({ n }: { n: number } = { n: 0 }) => [
      useTransition(n, { duration: 2000, easing: [0, 2, 0, 1] }),
      useTransition(n, { duration: 2000, easing: [1, 0, 1, -1] }),
    ],
    { initialProps: { n: 0 } },
  )

  await rerender({ n: 1 })

  // easeOutBack overshoots above the target, easeInBack undershoots below it
  await expect
    .poll(() => result.current[0] > 1 && result.current[1] < 0, { interval: 25, timeout: 1500 })
    .toBe(true)

  await expect.poll(() => result.current[0], { interval: 50, timeout: 3000 }).toBe(1)
  await expect.poll(() => result.current[1], { interval: 50, timeout: 1000 }).toBe(1)
})

it('useTransition supports custom easing functions', async () => {
  const easeInQuad = vi.fn((n: number) => n * n)
  const { result, rerender } = await renderHook(
    ({ n }: { n: number } = { n: 0 }) => useTransition(n, { duration: 300, easing: easeInQuad }),
    { initialProps: { n: 0 } },
  )

  expect(easeInQuad).not.toHaveBeenCalled()

  await rerender({ n: 100 })

  await expect
    .poll(() => easeInQuad, { interval: 10, timeout: 500 })
    .toHaveBeenCalled()

  await expect
    .poll(() => result.current, { interval: 10, timeout: 200 })
    .toBeGreaterThan(0)

  expect(result.current).toBeLessThan(100)

  await expect
    .poll(() => result.current, { interval: 25, timeout: 2000 })
    .toBe(100)
})

it('useTransition applies the easing function to the transition progress', async () => {
  const { result, rerender } = await renderHook(
    ({ n }: { n: number } = { n: 0 }) => useTransition(n, { duration: 2000, easing: () => 0.5 }),
    { initialProps: { n: 0 } },
  )

  await rerender({ n: 100 })

  // a constant easing of 0.5 lands exactly halfway on the first frame
  await expect
    .poll(() => result.current, { interval: 10, timeout: 500 })
    .toBe(50)

  await expect
    .poll(() => result.current, { interval: 50, timeout: 3000 })
    .toBe(100)
})

it('useTransition accepts TransitionPresets easing', async () => {
  const { result, rerender } = await renderHook(
    ({ n }: { n: number } = { n: 0 }) => useTransition(n, { duration: 100, easing: TransitionPresets.linear }),
    { initialProps: { n: 0 } },
  )

  await rerender({ n: 25 })

  await expect
    .poll(() => result.current, { interval: 25, timeout: 2000 })
    .toBe(25)
})

it('useTransition supports delayed transitions', async () => {
  const onStarted = vi.fn()
  const { result, rerender } = await renderHook(
    ({ n }: { n: number } = { n: 0 }) => useTransition(n, { duration: 100, delay: 300, onStarted }),
    { initialProps: { n: 0 } },
  )

  await rerender({ n: 100 })

  expect(result.current).toBe(0)
  expect(onStarted).not.toHaveBeenCalled()

  await expect
    .poll(() => result.current, { interval: 25, timeout: 2000 })
    .toBe(100)

  expect(onStarted).toHaveBeenCalledTimes(1)
})

it('useTransition clears a pending delayed transition when the source changes', async () => {
  const onStarted = vi.fn()
  const onFinished = vi.fn()
  const { result, rerender } = await renderHook(
    ({ n }: { n: number } = { n: 0 }) => useTransition(n, { duration: 100, delay: 300, onStarted, onFinished }),
    { initialProps: { n: 0 } },
  )

  await rerender({ n: 1 })
  await sleep(50)
  await rerender({ n: 2 })

  await expect
    .poll(() => result.current, { interval: 25, timeout: 2000 })
    .toBe(2)

  expect(onStarted).toHaveBeenCalledTimes(1)
  expect(onFinished).toHaveBeenCalledTimes(1)
})

it('useTransition can be disabled for synchronous changes', async () => {
  const onStarted = vi.fn()
  const { result, rerender } = await renderHook(
    ({ n, disabled }: { n: number, disabled?: boolean } = { n: 0 }) => useTransition(n, { duration: 100, disabled, onStarted }),
    { initialProps: { n: 0, disabled: true } },
  )

  await rerender({ n: 100, disabled: true })

  expect(result.current).toBe(100)

  await sleep(150)
  expect(onStarted).not.toHaveBeenCalled()
  expect(result.current).toBe(100)

  await rerender({ n: 100, disabled: false })

  expect(result.current).toBe(100)
  expect(onStarted).not.toHaveBeenCalled()
})

it('useTransition starts a new transition from the interrupted position', async () => {
  const { result, rerender } = await renderHook(
    ({ n }: { n: number } = { n: 0 }) => useTransition(n, { duration: 3000 }),
    { initialProps: { n: 0 } },
  )

  await rerender({ n: 100 })

  await expect
    .poll(() => result.current, { interval: 25, timeout: 1800 })
    .toBeGreaterThanOrEqual(40)

  await rerender({ n: 0 })

  await sleep(200)

  // still tweening down from the interrupted value, never reset to the target
  expect(result.current).toBeGreaterThan(20)
  expect(result.current).toBeLessThan(70)

  await expect
    .poll(() => result.current, { interval: 100, timeout: 4000 })
    .toBe(0)
})

it('useTransition stops updating after unmount', async () => {
  const onFinished = vi.fn()
  const { result, rerender, unmount } = await renderHook(
    ({ n }: { n: number } = { n: 0 }) => useTransition(n, { duration: 300, onFinished }),
    { initialProps: { n: 0 } },
  )

  await rerender({ n: 100 })

  await expect
    .poll(() => result.current, { interval: 10, timeout: 150 })
    .toBeGreaterThan(0)

  unmount()

  await sleep(400)
  expect(onFinished).not.toHaveBeenCalled()
})

it('useTransition does not transition on mount', async () => {
  const onStarted = vi.fn()
  const onFinished = vi.fn()
  const { result } = await renderHook(() => useTransition(7, { duration: 50, onStarted, onFinished }))

  expect(result.current).toBe(7)

  await sleep(150)
  expect(result.current).toBe(7)
  expect(onStarted).not.toHaveBeenCalled()
  expect(onFinished).not.toHaveBeenCalled()
})

it('useTransition snaps when the source array length changes', async () => {
  const { result, rerender } = await renderHook(
    ({ v }: { v: number[] } = { v: [0] }) => useTransition(v, { duration: 100 }),
    { initialProps: { v: [0, 0] } },
  )

  await rerender({ v: [10] })

  await expect
    .poll(() => result.current, { interval: 25, timeout: 1000 })
    .toEqual([10])
})
