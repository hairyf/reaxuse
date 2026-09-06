import type { UseWindowSizeReturn } from './useWindowSize'
import { afterEach, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useWindowSize } from './useWindowSize'

afterEach(() => {
  vi.restoreAllMocks()
})

interface FakeWindowDims {
  innerWidth?: number
  innerHeight?: number
  outerWidth?: number
  outerHeight?: number
  clientWidth?: number
  clientHeight?: number
}

/**
 * A window double with controlled dimensions: `dims.*` stay mutable through
 * getters (so resize handlers re-read the new values), and every
 * `addEventListener` call is recorded into `listeners` keyed by
 * `` `${target}:${event}` `` (window / viewport / media) so tests can fire
 * synthetic updates deterministically.
 */
function createFakeWindow(dimsOverride: FakeWindowDims = {}, visualViewport?: { width: number, height: number, scale: number }) {
  const listeners: Record<string, Array<() => void>> = {}
  const dims = {
    innerWidth: 1024,
    innerHeight: 768,
    outerWidth: 1280,
    outerHeight: 800,
    ...dimsOverride,
  }
  dims.clientWidth ??= dims.innerWidth
  dims.clientHeight ??= dims.innerHeight

  const bind = (key: string) => ({
    addEventListener: (type: string, listener: () => void) => {
      ;(listeners[`${key}:${type}`] ??= []).push(listener)
    },
    removeEventListener: (type: string, listener: () => void) => {
      const name = `${key}:${type}`
      listeners[name] = (listeners[name] ?? []).filter(stored => stored !== listener)
    },
  })

  const fakeWindow = {
    get innerWidth() {
      return dims.innerWidth
    },
    get innerHeight() {
      return dims.innerHeight
    },
    get outerWidth() {
      return dims.outerWidth
    },
    get outerHeight() {
      return dims.outerHeight
    },
    document: {
      documentElement: {
        get clientWidth() {
          return dims.clientWidth
        },
        get clientHeight() {
          return dims.clientHeight
        },
      },
    },
    visualViewport: visualViewport
      ? { ...visualViewport, ...bind('viewport') }
      : undefined,
    matchMedia: (query: string) => ({ matches: false, media: query, ...bind('media') }),
    ...bind('window'),
  } as unknown as Window

  return { dims, fakeWindow, listeners }
}

it('useWindowSize is defined', () => {
  expect(useWindowSize).toBeDefined()
})

it('useWindowSize reports the real window size once mounted', async () => {
  const { result } = await renderHook(() => useWindowSize({ initialWidth: 100, initialHeight: 200 }))

  expect(result.current).toEqual({ width: window.innerWidth, height: window.innerHeight })
})

it('useWindowSize renders Infinity defaults before the mount effect', async () => {
  const rendered: UseWindowSizeReturn[] = []
  const { result } = await renderHook(() => {
    const size = useWindowSize()
    rendered.push(size)
    return size
  })

  expect(rendered[0]).toEqual({ width: Number.POSITIVE_INFINITY, height: Number.POSITIVE_INFINITY })
  expect(result.current).toEqual({ width: window.innerWidth, height: window.innerHeight })
})

it('useWindowSize honors initialWidth/initialHeight before the mount effect', async () => {
  const rendered: UseWindowSizeReturn[] = []
  const { result } = await renderHook(() => {
    const size = useWindowSize({ initialWidth: 100, initialHeight: 200 })
    rendered.push(size)
    return size
  })

  expect(rendered[0]).toEqual({ width: 100, height: 200 })
  expect(result.current).toEqual({ width: window.innerWidth, height: window.innerHeight })
})

it('useWindowSize refreshes on window resize events', async () => {
  const { result, act } = await renderHook(() => useWindowSize())

  await act(() => {
    window.dispatchEvent(new Event('resize'))
  })

  expect(result.current).toEqual({ width: window.innerWidth, height: window.innerHeight })
})

it('useWindowSize re-reads the size on window resize events', async () => {
  const { dims, fakeWindow, listeners } = createFakeWindow()
  const { result, act } = await renderHook(() => useWindowSize({ window: fakeWindow }))

  expect(result.current).toEqual({ width: 1024, height: 768 })

  dims.innerWidth = 500
  dims.innerHeight = 400
  await act(() => {
    listeners['window:resize'].forEach(listener => listener())
  })

  expect(result.current).toEqual({ width: 500, height: 400 })
})

it('useWindowSize excludes the scrollbar with includeScrollbar: false', async () => {
  const { fakeWindow } = createFakeWindow({ clientWidth: 1000, clientHeight: 744 })
  const { result } = await renderHook(() => useWindowSize({ window: fakeWindow, includeScrollbar: false }))

  expect(result.current).toEqual({ width: 1000, height: 744 })
})

it('useWindowSize uses outer dimensions with type: \'outer\'', async () => {
  const { fakeWindow } = createFakeWindow()
  const { result } = await renderHook(() => useWindowSize({ window: fakeWindow, type: 'outer' }))

  expect(result.current).toEqual({ width: 1280, height: 800 })
})

it('useWindowSize reads the visual viewport with type: \'visual\'', async () => {
  const { fakeWindow, listeners } = createFakeWindow({}, { width: 500.4, height: 800.6, scale: 2 })
  const { result } = await renderHook(() => useWindowSize({ window: fakeWindow, type: 'visual' }))

  expect(result.current).toEqual({ width: Math.round(500.4 * 2), height: Math.round(800.6 * 2) })
  expect(listeners['viewport:resize']).toHaveLength(1)
})

it('useWindowSize listens to the orientation media query by default', async () => {
  const matchMediaSpy = vi.spyOn(window, 'matchMedia')
  const { unmount } = await renderHook(() => useWindowSize({ initialWidth: 100, initialHeight: 200 }))
  unmount()

  const orientationCalls = matchMediaSpy.mock.calls.filter(([query]) => query === '(orientation: portrait)')
  expect(orientationCalls).toHaveLength(1)
})

it('useWindowSize skips the orientation media query with listenOrientation: false', async () => {
  const matchMediaSpy = vi.spyOn(window, 'matchMedia')
  const { unmount } = await renderHook(() => useWindowSize({ initialWidth: 100, initialHeight: 200, listenOrientation: false }))
  unmount()

  const orientationCalls = matchMediaSpy.mock.calls.filter(([query]) => query === '(orientation: portrait)')
  expect(orientationCalls).toHaveLength(0)
})

it('useWindowSize updates on the orientation media-query change', async () => {
  const { dims, fakeWindow, listeners } = createFakeWindow()
  const { result, act } = await renderHook(() => useWindowSize({ window: fakeWindow }))

  expect(listeners['media:change']).toHaveLength(1)

  dims.innerWidth = 300
  await act(() => {
    listeners['media:change'].forEach(listener => listener())
  })

  expect(result.current).toEqual({ width: 300, height: 768 })
})

it('useWindowSize attaches a passive resize listener', async () => {
  const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
  const { unmount } = await renderHook(() => useWindowSize({ listenOrientation: false }))
  unmount()

  const resizeCalls = addEventListenerSpy.mock.calls.filter(args => (args[0] as string) === 'resize')
  expect(resizeCalls).toHaveLength(1)
  expect(resizeCalls[0][2]).toEqual({ passive: true })
})

it('useWindowSize removes its listeners on unmount', async () => {
  const { dims, fakeWindow, listeners } = createFakeWindow()
  const { result, unmount } = await renderHook(() => useWindowSize({ window: fakeWindow }))

  expect(listeners['window:resize']).toHaveLength(1)
  expect(listeners['media:change']).toHaveLength(1)

  unmount()

  expect(listeners['window:resize']).toHaveLength(0)
  expect(listeners['media:change']).toHaveLength(0)

  dims.innerWidth = 333
  expect(result.current).toEqual({ width: 1024, height: 768 })
})
