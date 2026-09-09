import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useDeviceOrientation } from '../useDeviceOrientation'

// `DeviceOrientationEvent.absolute` is typed `boolean` in lib.dom, but some
// implementations report `null` when the orientation is relative — accept it
// in the dispatch shape (the hook state is `boolean | null`).
interface DeviceOrientationData {
  absolute?: boolean | null
  alpha?: number | null
  beta?: number | null
  gamma?: number | null
}

function dispatchDeviceOrientation(data: DeviceOrientationData = {}) {
  const event = new Event('deviceorientation')
  Object.assign(event, data)
  window.dispatchEvent(event)
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('useDeviceOrientation', () => {
  it('should initialize with upstream defaults before the first event', async () => {
    const { result } = await renderHook(() => useDeviceOrientation())

    expect(result.current.isAbsolute).toBe(false)
    expect(result.current.alpha).toBeNull()
    expect(result.current.beta).toBeNull()
    expect(result.current.gamma).toBeNull()
    await expect.poll(() => result.current.isSupported).toBe(true)
  })

  it('should update all states from a deviceorientation event', async () => {
    const { result, act } = await renderHook(() => useDeviceOrientation())

    await act(() => {
      dispatchDeviceOrientation({
        absolute: true,
        alpha: 90,
        beta: 45,
        gamma: 30,
      })
    })

    expect(result.current.isAbsolute).toBe(true)
    expect(result.current.alpha).toBe(90)
    expect(result.current.beta).toBe(45)
    expect(result.current.gamma).toBe(30)
  })

  it('should accept null event fields (isAbsolute is not always reported)', async () => {
    const { result, act } = await renderHook(() => useDeviceOrientation())

    await act(() => {
      dispatchDeviceOrientation({
        absolute: null,
        alpha: 10,
        beta: 20,
        gamma: 30,
      })
    })

    expect(result.current.isAbsolute).toBeNull()
    expect(result.current.alpha).toBe(10)
  })

  it('should support a custom window option', async () => {
    const listeners: Record<string, Array<(event: Event) => void>> = {}
    const fakeWindow = {
      DeviceOrientationEvent: class DeviceOrientationEvent {},
      addEventListener: (type: string, listener: (event: Event) => void) => {
        (listeners[type] ??= []).push(listener)
      },
      removeEventListener: () => {},
    } as unknown as Window

    const { result, act } = await renderHook(() => useDeviceOrientation({ window: fakeWindow }))

    await expect.poll(() => result.current.isSupported).toBe(true)

    await act(() => {
      const event = new Event('deviceorientation')
      Object.assign(event, { absolute: false, alpha: 10, beta: 20, gamma: 30 })
      listeners.deviceorientation.forEach(listener => listener(event))
    })

    expect(result.current.isAbsolute).toBe(false)
    expect(result.current.alpha).toBe(10)
    expect(result.current.beta).toBe(20)
    expect(result.current.gamma).toBe(30)
  })

  it('should stay inert when the custom window lacks DeviceOrientationEvent', async () => {
    const listeners: Record<string, Array<(event: Event) => void>> = {}
    const fakeWindow = {
      addEventListener: (type: string, listener: (event: Event) => void) => {
        (listeners[type] ??= []).push(listener)
      },
      removeEventListener: () => {},
    } as unknown as Window

    const { result, act } = await renderHook(() => useDeviceOrientation({ window: fakeWindow }))

    expect(result.current.isSupported).toBe(false)
    // no listener was attached — dispatching changes nothing
    await act(() => {
      const event = new Event('deviceorientation')
      Object.assign(event, { absolute: true, alpha: 10, beta: 20, gamma: 30 })
      ;(listeners.deviceorientation ?? []).forEach(listener => listener(event))
    })
    expect(result.current.isAbsolute).toBe(false)
    expect(result.current.alpha).toBeNull()
  })

  it('is SSR-safe when no window exists', async () => {
    const { result } = await renderHook(() => useDeviceOrientation({ window: null as unknown as Window }))

    expect(result.current.isSupported).toBe(false)
    expect(result.current.isAbsolute).toBe(false)
    expect(result.current.alpha).toBeNull()
    expect(result.current.beta).toBeNull()
    expect(result.current.gamma).toBeNull()
  })

  it('re-registers the listener when the custom window changes', async () => {
    function createFakeWindow() {
      const listeners = new Set<(event: Event) => void>()
      return {
        fakeWindow: {
          DeviceOrientationEvent: class DeviceOrientationEvent {},
          addEventListener: (type: string, listener: (event: Event) => void) => {
            if (type === 'deviceorientation')
              listeners.add(listener)
          },
          removeEventListener: (type: string, listener: (event: Event) => void) => {
            if (type === 'deviceorientation')
              listeners.delete(listener)
          },
        } as unknown as Window,
        listenerCount: () => listeners.size,
        emit: (data: DeviceOrientationData) => {
          const event = new Event('deviceorientation')
          Object.assign(event, data)
          listeners.forEach(listener => listener(event))
        },
      }
    }

    const first = createFakeWindow()
    const second = createFakeWindow()

    const { result, rerender, act } = await renderHook(
      (props?: { win: Window }) => useDeviceOrientation({ window: props?.win }),
      { initialProps: { win: first.fakeWindow } },
    )

    expect(first.listenerCount()).toBe(1)
    expect(second.listenerCount()).toBe(0)

    await rerender({ win: second.fakeWindow })

    expect(first.listenerCount()).toBe(0)
    expect(second.listenerCount()).toBe(1)

    // events on the new target still update state
    await act(() => {
      second.emit({ absolute: true, alpha: 90, beta: 45, gamma: 30 })
    })
    expect(result.current.isAbsolute).toBe(true)
    expect(result.current.alpha).toBe(90)
    expect(result.current.beta).toBe(45)
    expect(result.current.gamma).toBe(30)
  })

  it('should remove its listener on unmount', async () => {
    const { result, act, unmount } = await renderHook(() => useDeviceOrientation())

    await act(() => {
      dispatchDeviceOrientation({ absolute: true, alpha: 10, beta: 20, gamma: 30 })
    })
    expect(result.current.alpha).toBe(10)

    unmount()

    // the listener was removed on unmount, so subsequent events do not
    // mutate the (frozen) returned state
    await act(() => {
      dispatchDeviceOrientation({ absolute: false, alpha: 90, beta: 45, gamma: 0 })
    })
    expect(result.current.isAbsolute).toBe(true)
    expect(result.current.alpha).toBe(10)
    expect(result.current.beta).toBe(20)
    expect(result.current.gamma).toBe(30)
  })
})
