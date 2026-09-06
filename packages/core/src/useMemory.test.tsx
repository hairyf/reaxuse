import type { MemoryInfo } from './useMemory'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useMemory } from './useMemory'

function getMemory(): MemoryInfo | undefined {
  if (typeof performance !== 'undefined' && 'memory' in performance)
    return (performance as Performance & { memory: MemoryInfo }).memory
  return undefined
}

const isSupportedInEnv = getMemory() !== undefined

it('useMemory reports support matching the environment', async () => {
  const { result } = await renderHook(() => useMemory())

  expect(result.current.isSupported).toBe(isSupportedInEnv)
})

it('useMemory reads the current performance.memory info', async () => {
  const { result } = await renderHook(() => useMemory())

  if (isSupportedInEnv) {
    expect(result.current.memory).toEqual(getMemory())
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
  expect(values[values.length - 1].memory).toEqual(getMemory())
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
  expect(result.current.memory).toEqual(getMemory())

  unmount()
})
