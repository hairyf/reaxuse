import type { MemoryInfo } from '../useMemory'
import { expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useMemory } from '../useMemory'

/**
 * Probe support independently of the implementation: `performance.memory` is
 * a getter on the prototype chain (Chromium: `Performance.prototype`), while
 * the impl instead checks `'memory' in performance`. Sharing the impl's
 * detection here would let a detection regression pass both sides.
 */
function envSupportsPerformanceMemory(): boolean {
  let target: object | null = performance
  while (target) {
    if (Object.getOwnPropertyDescriptor(target, 'memory'))
      return true
    target = Object.getPrototypeOf(target)
  }
  return false
}

function readEnvMemory(): MemoryInfo | undefined {
  return (performance as Performance & { memory: MemoryInfo }).memory
}

/**
 * Remove the `performance.memory` getter from the prototype chain so the hook
 * observes an unsupported environment; returns a restore function.
 */
function hidePerformanceMemory(): () => void {
  let target: object | null = performance
  while (target) {
    const descriptor = Object.getOwnPropertyDescriptor(target, 'memory')
    if (descriptor) {
      const owner = target
      Reflect.deleteProperty(owner, 'memory')
      return () => Object.defineProperty(owner, 'memory', descriptor)
    }
    target = Object.getPrototypeOf(target)
  }
  return () => {}
}

const isSupportedInEnv = envSupportsPerformanceMemory()

it('useMemory reports support matching the environment', async () => {
  const { result } = await renderHook(() => useMemory())

  expect(result.current.isSupported).toBe(isSupportedInEnv)
})

it('useMemory reads the current performance.memory info', async () => {
  const { result } = await renderHook(() => useMemory())

  if (isSupportedInEnv) {
    expect(result.current.memory).toEqual(readEnvMemory())
    expect(result.current.memory!.usedJSHeapSize).toBeTypeOf('number')
    expect(result.current.memory!.totalJSHeapSize).toBeTypeOf('number')
    expect(result.current.memory!.jsHeapSizeLimit).toBeTypeOf('number')
  }
  else {
    expect(result.current.memory).toBeUndefined()
  }
})

it('useMemory keeps the SSR-safe defaults during render and resolves in a mount effect', async () => {
  const values: Array<{ isSupported: boolean, memory: MemoryInfo | undefined }> = []

  function Probe() {
    const { isSupported, memory } = useMemory()
    values.push({ isSupported, memory })

    return <div>{isSupported ? 'supported' : 'unsupported'}</div>
  }

  const screen = await render(<Probe />)

  // render-time values are the SSR-safe defaults
  expect(values[0].isSupported).toBe(false)
  expect(values[0].memory).toBeUndefined()

  // the mount effect probes the API and re-renders
  await expect.element(screen.getByText(isSupportedInEnv ? 'supported' : 'unsupported')).toBeVisible()
  expect(values[values.length - 1].isSupported).toBe(isSupportedInEnv)
  expect(values[values.length - 1].memory).toEqual(readEnvMemory())
})

it('useMemory refreshes memory through the scheduler', async () => {
  let tick: (() => void) | undefined
  let schedulerCalls = 0

  const { result, act, unmount } = await renderHook(() => useMemory({
    scheduler: (cb) => {
      schedulerCalls += 1
      tick = cb
      return { isActive: true, pause: () => {}, resume: () => {} }
    },
  }))

  // the scheduler is composed during render
  expect(schedulerCalls).toBeGreaterThan(0)
  expect(tick).toBeTypeOf('function')

  // invoking the scheduler callback re-reads performance.memory
  await act(() => tick?.())
  expect(result.current.memory).toEqual(readEnvMemory())

  unmount()
})

it('useMemory does not start the polling loop when the API is unsupported', async () => {
  const restore = hidePerformanceMemory()
  const pause = vi.fn()
  const resume = vi.fn()

  try {
    const { result, unmount } = await renderHook(() => useMemory({
      scheduler: () => ({ isActive: false, pause, resume }),
    }))

    expect(result.current.isSupported).toBe(false)
    expect(result.current.memory).toBeUndefined()

    // the guard pauses the loop and never starts it
    await expect.poll(() => pause.mock.calls.length).toBeGreaterThan(0)
    expect(resume).not.toHaveBeenCalled()

    unmount()
  }
  finally {
    restore()
  }
})

it('useMemory clears the default polling timer when the API is unsupported', async () => {
  const restore = hidePerformanceMemory()
  const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
  const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')

  try {
    const { result, unmount } = await renderHook(() => useMemory())

    expect(result.current.isSupported).toBe(false)

    const startedIds = setIntervalSpy.mock.results.map(entry => entry.value)
    const clearedIds = clearIntervalSpy.mock.calls.map(([id]) => id)

    // the default scheduler starts its timer on mount, the guard pauses it
    expect(startedIds.length).toBeGreaterThan(0)
    expect(startedIds.every(id => clearedIds.includes(id))).toBe(true)

    unmount()
  }
  finally {
    setIntervalSpy.mockRestore()
    clearIntervalSpy.mockRestore()
    restore()
  }
})

it.skipIf(!isSupportedInEnv)('useMemory resumes the polling loop once support is detected', async () => {
  const calls: string[] = []

  const { result, unmount } = await renderHook(() => useMemory({
    scheduler: () => ({
      isActive: true,
      pause: () => calls.push('pause'),
      resume: () => calls.push('resume'),
    }),
  }))

  expect(result.current.isSupported).toBe(true)
  // support is unresolved on the first render, so the loop starts paused and
  // the guard resumes it when the mount probe resolves
  await expect.poll(() => calls.at(-1)).toBe('resume')
  expect(calls).toContain('pause')

  unmount()
})
