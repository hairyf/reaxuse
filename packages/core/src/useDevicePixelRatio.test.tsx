import type { UseDevicePixelRatioReturn } from './useDevicePixelRatio'
import { afterEach, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useDevicePixelRatio } from './useDevicePixelRatio'

type ChangeListener = (event: MediaQueryListEvent) => void

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * A window double with a mutable `devicePixelRatio` getter and a stub
 * `matchMedia` that records every queried resolution string and keeps a
 * `change`-listener registry, so resolution changes can be dispatched
 * deterministically (mirroring the real `addEventListener('change', ...)`
 * semantics the hook relies on).
 */
function createFakeWindow(initialDPR = 1) {
  let dpr = initialDPR
  const queries: string[] = []
  const listeners = new Set<ChangeListener>()

  const fakeWindow = {
    get devicePixelRatio() {
      return dpr
    },
    matchMedia: (query: string) => {
      queries.push(query)
      return {
        matches: true,
        addEventListener: (type: string, listener: ChangeListener) => {
          if (type === 'change')
            listeners.add(listener)
        },
        removeEventListener: (type: string, listener: ChangeListener) => {
          listeners.delete(listener)
        },
      } as unknown as MediaQueryList
    },
  } as unknown as Window

  return {
    fakeWindow,
    queries,
    listenerCount: () => listeners.size,
    changeDPR: (next: number) => {
      dpr = next
      listeners.forEach(listener => listener({ matches: false } as MediaQueryListEvent))
    },
  }
}

it('useDevicePixelRatio is defined', () => {
  expect(useDevicePixelRatio).toBeDefined()
})

it('useDevicePixelRatio renders 1 before the mount effect (SSR-safe)', async () => {
  const rendered: UseDevicePixelRatioReturn[] = []
  const { result } = await renderHook(() => {
    const ratio = useDevicePixelRatio()
    rendered.push(ratio)
    return ratio
  })

  expect(rendered[0]).toEqual({ pixelRatio: 1 })
  await expect.poll(() => result.current.pixelRatio).toBe(window.devicePixelRatio)
})

it('useDevicePixelRatio reports the real devicePixelRatio once mounted', async () => {
  const { result } = await renderHook(() => useDevicePixelRatio())

  await expect.poll(() => result.current.pixelRatio).toBe(window.devicePixelRatio)
})

it('useDevicePixelRatio stays at 1 without matchMedia support', async () => {
  const { result } = await renderHook(() => useDevicePixelRatio({
    window: { devicePixelRatio: 2 } as unknown as Window,
  }))

  expect(result.current).toEqual({ pixelRatio: 1 })
})

it('useDevicePixelRatio updates on a resolution change', async () => {
  const { fakeWindow, queries, changeDPR } = createFakeWindow(1)
  const { result, act } = await renderHook(() => useDevicePixelRatio({ window: fakeWindow }))

  await expect.poll(() => result.current.pixelRatio).toBe(1)
  expect(queries).toContain('(resolution: 1dppx)')

  await act(() => {
    changeDPR(2)
  })
  await expect.poll(() => result.current.pixelRatio).toBe(2)
  expect(queries).toContain('(resolution: 2dppx)')

  await act(() => {
    changeDPR(3)
  })
  await expect.poll(() => result.current.pixelRatio).toBe(3)
  expect(queries).toContain('(resolution: 3dppx)')
})

it('useDevicePixelRatio removes its change listener on unmount', async () => {
  const { fakeWindow, listenerCount } = createFakeWindow(1)
  const { result, unmount } = await renderHook(() => useDevicePixelRatio({ window: fakeWindow }))

  await expect.poll(() => listenerCount()).toBeGreaterThan(0)

  unmount()
  expect(listenerCount()).toBe(0)

  // no listener → a stale change can no longer mutate the returned state
  await expect.poll(() => result.current.pixelRatio).toBe(1)
})
