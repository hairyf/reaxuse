import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useDeviceMotion } from './useDeviceMotion'

const DEFAULT_ACCELERATION = { x: null, y: null, z: null }
const DEFAULT_ROTATION_RATE = { alpha: null, beta: null, gamma: null }

function dispatchDeviceMotion(data: Partial<DeviceMotionEvent> = {}) {
  const event = new Event('devicemotion')
  Object.assign(event, data)
  window.dispatchEvent(event)
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('useDeviceMotion', () => {
  it('should initialize with the upstream default values', async () => {
    const { result } = await renderHook(() => useDeviceMotion())

    expect(result.current.acceleration).toEqual(DEFAULT_ACCELERATION)
    expect(result.current.accelerationIncludingGravity).toEqual(DEFAULT_ACCELERATION)
    expect(result.current.rotationRate).toEqual(DEFAULT_ROTATION_RATE)
    expect(result.current.interval).toBe(0)
    expect(result.current.permissionGranted).toBe(false)
  })

  it('should update all states from a devicemotion event', async () => {
    const { result, act } = await renderHook(() => useDeviceMotion())

    await act(() => {
      dispatchDeviceMotion({
        acceleration: { x: 1, y: 2, z: 3 },
        accelerationIncludingGravity: { x: 4, y: 5, z: 6 },
        rotationRate: { alpha: 7, beta: 8, gamma: 9 },
        interval: 16,
      })
    })

    expect(result.current.acceleration).toEqual({ x: 1, y: 2, z: 3 })
    expect(result.current.accelerationIncludingGravity).toEqual({ x: 4, y: 5, z: 6 })
    expect(result.current.rotationRate).toEqual({ alpha: 7, beta: 8, gamma: 9 })
    expect(result.current.interval).toBe(16)
  })

  it('should fall back to nulls when the event data is missing', async () => {
    const { result, act } = await renderHook(() => useDeviceMotion())

    await act(() => {
      dispatchDeviceMotion({ rotationRate: { alpha: 1, beta: 2, gamma: 3 }, interval: 16 })
    })

    expect(result.current.acceleration).toEqual(DEFAULT_ACCELERATION)
    expect(result.current.accelerationIncludingGravity).toEqual(DEFAULT_ACCELERATION)
    expect(result.current.rotationRate).toEqual({ alpha: 1, beta: 2, gamma: 3 })
  })

  it('should resolve isSupported matching the current environment', async () => {
    const { result } = await renderHook(() => useDeviceMotion())

    await vi.waitFor(() => {
      expect(result.current.isSupported).toBe(typeof DeviceMotionEvent !== 'undefined')
    })
  })

  it('should be SSR-safe when DeviceMotionEvent is unavailable', async () => {
    vi.stubGlobal('DeviceMotionEvent', undefined)

    const { result, act } = await renderHook(() => useDeviceMotion())

    expect(result.current.isSupported).toBe(false)
    expect(result.current.requirePermissions).toBe(false)
    expect(result.current.acceleration).toEqual(DEFAULT_ACCELERATION)
    expect(result.current.rotationRate).toEqual(DEFAULT_ROTATION_RATE)
    expect(result.current.interval).toBe(0)

    // no listener was attached, so dispatching an event changes nothing
    await act(() => {
      dispatchDeviceMotion({ acceleration: { x: 9, y: 9, z: 9 }, interval: 100 })
    })
    expect(result.current.acceleration).toEqual(DEFAULT_ACCELERATION)
  })

  it('should request permissions and start the listener when granted', async () => {
    const requestPermission = vi.fn(() => Promise.resolve<'granted'>('granted'))
    class FakeDeviceMotionEvent extends Event {
      static requestPermission = requestPermission
    }
    vi.stubGlobal('DeviceMotionEvent', FakeDeviceMotionEvent)

    const { result, act } = await renderHook(() => useDeviceMotion({ requestPermissions: true }))

    await vi.waitFor(() => {
      expect(result.current.permissionGranted).toBe(true)
    })
    expect(requestPermission).toHaveBeenCalledTimes(1)

    await act(() => {
      dispatchDeviceMotion({ acceleration: { x: 9, y: 9, z: 9 }, interval: 100 })
    })

    expect(result.current.acceleration).toEqual({ x: 9, y: 9, z: 9 })
    expect(result.current.interval).toBe(100)
  })

  it('should support a custom window option', async () => {
    const listeners: Record<string, Array<(event: Event) => void>> = {}
    const fakeWindow = {
      addEventListener: (type: string, listener: (event: Event) => void) => {
        (listeners[type] ??= []).push(listener)
      },
      removeEventListener: () => {},
    } as unknown as Window

    const { result, act } = await renderHook(() => useDeviceMotion({ window: fakeWindow }))

    await act(() => {
      const event = new Event('devicemotion')
      Object.assign(event, { rotationRate: { alpha: 0.5, beta: 0.25, gamma: 0.125 }, interval: 32 })
      listeners.devicemotion.forEach(listener => listener(event))
    })

    expect(result.current.rotationRate).toEqual({ alpha: 0.5, beta: 0.25, gamma: 0.125 })
    expect(result.current.interval).toBe(32)
  })
})
