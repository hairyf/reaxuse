import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useDeviceOrientation } from './useDeviceOrientation'

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
  it('should initialize with null values before the first event', async () => {
    const { result } = await renderHook(() => useDeviceOrientation())

    expect(result.current.isAbsolute).toBeNull()
    expect(result.current.alpha).toBeNull()
    expect(result.current.beta).toBeNull()
    expect(result.current.gamma).toBeNull()
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
      addEventListener: (type: string, listener: (event: Event) => void) => {
        (listeners[type] ??= []).push(listener)
      },
      removeEventListener: () => {},
    } as unknown as Window

    const { result, act } = await renderHook(() => useDeviceOrientation({ window: fakeWindow }))

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
