import { afterEach, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useScreenOrientation } from './useScreenOrientation'

interface FakeScreenOrientation {
  type: string
  angle: number
  lockCalls: string[]
  unlockCalls: number
  addEventListener: (type: string, listener: () => void, options?: unknown) => void
  removeEventListener: (type: string, listener: () => void, options?: unknown) => void
  dispatchEvent: (event: Event) => boolean
  lock: (type: string) => Promise<void>
  unlock: () => void
}

function createFakeScreenOrientation(initial: {
  type?: string
  angle?: number
  lock?: (type: string) => Promise<void>
} = {}): FakeScreenOrientation {
  const fake: FakeScreenOrientation = {
    type: initial.type ?? 'portrait-primary',
    angle: initial.angle ?? 90,
    lockCalls: [],
    unlockCalls: 0,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    lock: initial.lock ?? ((type: string) => {
      fake.lockCalls.push(type)
      return Promise.resolve()
    }),
    unlock: () => {
      fake.unlockCalls += 1
    },
  }

  return fake
}

/**
 * Chromium exposes a real (environment-dependent) `screen.orientation`, so
 * shadow it with a deterministic own property. `afterEach` deletes the own
 * property again, which restores the browser's prototype accessor.
 */
function stubScreenOrientation(initial: {
  type?: string
  angle?: number
  lock?: (type: string) => Promise<void>
} = {}): FakeScreenOrientation {
  const fake = createFakeScreenOrientation(initial)

  Object.defineProperty(window.screen, 'orientation', {
    configurable: true,
    value: fake,
  })

  return fake
}

function setStubbedOrientation(type: string, angle: number) {
  const stub = window.screen.orientation as unknown as { type: string, angle: number }
  stub.type = type
  stub.angle = angle
}

function createFakeWindow(screenOrientation?: FakeScreenOrientation, options?: {
  onAddListener?: (type: string, listener: () => void) => void
  onRemoveListener?: (type: string, listener: () => void) => void
}): Window {
  // without a fake orientation the window models no Screen Orientation API
  // support (`screen` exists but has no `orientation`)
  const screen = screenOrientation ? { orientation: screenOrientation } : {}

  return {
    screen,
    addEventListener: (type: string, listener: () => void) => options?.onAddListener?.(type, listener),
    removeEventListener: (type: string, listener: () => void) => options?.onRemoveListener?.(type, listener),
  } as unknown as Window
}

afterEach(() => {
  delete (window.screen as { orientation?: unknown }).orientation
})

it('useScreenOrientation reads the initial type, angle and support from screen.orientation', async () => {
  stubScreenOrientation()
  const { result } = await renderHook(() => useScreenOrientation())

  expect(result.current.isSupported).toBe(true)
  expect(result.current.orientation).toBe('portrait-primary')
  expect(result.current.angle).toBe(90)
})

it('useScreenOrientation stays SSR-safe during render before the mount effect', async () => {
  stubScreenOrientation()
  const snapshots: Array<{ isSupported: boolean, orientation: string | undefined, angle: number }> = []

  function Probe() {
    const state = useScreenOrientation()

    snapshots.push({ isSupported: state.isSupported, orientation: state.orientation, angle: state.angle })

    return <div>{state.orientation}</div>
  }

  await render(<Probe />)

  expect(snapshots[0]).toEqual({ isSupported: false, orientation: undefined, angle: 0 })
})

it('useScreenOrientation updates orientation and angle on the window orientationchange event', async () => {
  stubScreenOrientation()
  const { result, act } = await renderHook(() => useScreenOrientation())

  setStubbedOrientation('landscape-primary', 270)

  await act(() => {
    window.dispatchEvent(new Event('orientationchange'))
  })

  expect(result.current.orientation).toBe('landscape-primary')
  expect(result.current.angle).toBe(270)
})

it('useScreenOrientation lockOrientation delegates to screen.orientation.lock and resolves', async () => {
  const fake = stubScreenOrientation()
  const { result } = await renderHook(() => useScreenOrientation())

  const promise = result.current.lockOrientation('portrait-secondary')

  expect(fake.lockCalls).toEqual(['portrait-secondary'])
  await expect(promise).resolves.toBeUndefined()
})

it('useScreenOrientation lockOrientation returns the lock rejection unchanged (upstream does not swallow)', async () => {
  stubScreenOrientation({
    lock: () => Promise.reject(new Error('orientation lock failed')),
  })
  const { result } = await renderHook(() => useScreenOrientation())

  await expect(result.current.lockOrientation('landscape')).rejects.toThrow('orientation lock failed')
})

it('useScreenOrientation lockOrientation rejects with "Not supported" without screen.orientation', async () => {
  const fakeWindow = createFakeWindow()

  const { result } = await renderHook(() => useScreenOrientation({ window: fakeWindow }))

  expect(result.current.isSupported).toBe(false)
  expect(result.current.orientation).toBeUndefined()
  expect(result.current.angle).toBe(0)
  await expect(result.current.lockOrientation('portrait')).rejects.toThrow('Not supported')
})

it('useScreenOrientation unlockOrientation delegates to screen.orientation.unlock', async () => {
  const fake = stubScreenOrientation()
  const { result } = await renderHook(() => useScreenOrientation())

  result.current.unlockOrientation()

  expect(fake.unlockCalls).toBe(1)
})

it('useScreenOrientation removes the orientationchange listener on unmount', async () => {
  const fake = createFakeScreenOrientation()
  const added: Array<() => void> = []
  const removed: Array<() => void> = []
  const fakeWindow = createFakeWindow(fake, {
    onAddListener: (type, listener) => {
      if (type === 'orientationchange')
        added.push(listener)
    },
    onRemoveListener: (type, listener) => {
      if (type === 'orientationchange')
        removed.push(listener)
    },
  })

  const { unmount } = await renderHook(() => useScreenOrientation({ window: fakeWindow }))

  expect(added.length).toBe(1)

  unmount()

  expect(removed).toEqual(added)
})

it('useScreenOrientation supports a custom window option', async () => {
  const fake = createFakeScreenOrientation()
  const listeners: Array<() => void> = []
  const fakeWindow = createFakeWindow(fake, {
    onAddListener: (type, listener) => {
      if (type === 'orientationchange')
        listeners.push(listener)
    },
  })

  const { result, act } = await renderHook(() => useScreenOrientation({ window: fakeWindow }))

  expect(result.current.isSupported).toBe(true)
  expect(result.current.orientation).toBe('portrait-primary')
  expect(result.current.angle).toBe(90)

  fake.type = 'landscape-primary'
  fake.angle = 270

  await act(() => {
    listeners.forEach((listener) => {
      listener()
    })
  })

  expect(result.current.orientation).toBe('landscape-primary')
  expect(result.current.angle).toBe(270)
})
