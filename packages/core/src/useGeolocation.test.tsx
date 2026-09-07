import type { UseGeolocationReturn } from './useGeolocation'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useGeolocation } from './useGeolocation'

const DEFAULT_COORDS = {
  accuracy: 0,
  latitude: Number.POSITIVE_INFINITY,
  longitude: Number.POSITIVE_INFINITY,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  speed: null,
}

function createFakeGeolocation() {
  const successCallbacks = new Map<number, (position: GeolocationPosition) => void>()
  const errorCallbacks = new Map<number, ((error: GeolocationPositionError) => void) | undefined>()
  let nextId = 0

  const geolocation = {
    watchPosition: vi.fn(
      (success: (position: GeolocationPosition) => void, error?: (error: GeolocationPositionError) => void) => {
        nextId += 1
        successCallbacks.set(nextId, success)
        errorCallbacks.set(nextId, error)
        return nextId
      },
    ),
    clearWatch: vi.fn((id: number) => {
      successCallbacks.delete(id)
      errorCallbacks.delete(id)
    }),
    getCurrentPosition: vi.fn(),
  }

  const fakeNavigator = { geolocation } as unknown as Navigator

  function firePosition(position: GeolocationPosition) {
    for (const callback of [...successCallbacks.values()])
      callback(position)
  }

  function fireError(error: GeolocationPositionError) {
    for (const callback of [...errorCallbacks.values()])
      callback?.(error)
  }

  return { geolocation, fakeNavigator, firePosition, fireError }
}

function makePosition(overrides?: Partial<GeolocationPosition>): GeolocationPosition {
  return {
    coords: {
      accuracy: 10,
      latitude: 51.5,
      longitude: -0.12,
      altitude: 100,
      altitudeAccuracy: 3,
      heading: 270,
      speed: 1.5,
    },
    timestamp: 1234567890,
    ...overrides,
  } as unknown as GeolocationPosition
}

describe('useGeolocation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exposes support matching the provided navigator', async () => {
    const fake = createFakeGeolocation()
    const { result } = await renderHook(() => useGeolocation({ navigator: fake.fakeNavigator }))

    expect(result.current.isSupported).toBe(true)
  })

  it('reports unsupported when navigator.geolocation is missing', async () => {
    const { result } = await renderHook(() => useGeolocation({ navigator: {} as Navigator }))

    expect(result.current.isSupported).toBe(false)
    expect(result.current.coords).toEqual(DEFAULT_COORDS)
    expect(result.current.locatedAt).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('starts watching on mount with the default PositionOptions', async () => {
    const fake = createFakeGeolocation()
    const { result } = await renderHook(() => useGeolocation({ navigator: fake.fakeNavigator }))

    expect(result.current.isSupported).toBe(true)
    expect(fake.geolocation.watchPosition).toHaveBeenCalledTimes(1)
    expect(fake.geolocation.watchPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000,
      },
    )
  })

  it('passes the custom PositionOptions to watchPosition', async () => {
    const fake = createFakeGeolocation()
    await renderHook(() => useGeolocation({
      navigator: fake.fakeNavigator,
      enableHighAccuracy: false,
      maximumAge: 5000,
      timeout: 1000,
    }))

    expect(fake.geolocation.watchPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: false,
        maximumAge: 5000,
        timeout: 1000,
      },
    )
  })

  it('updates coords and locatedAt when a position is reported', async () => {
    const fake = createFakeGeolocation()
    const { result, act } = await renderHook(() => useGeolocation({ navigator: fake.fakeNavigator }))

    const position = makePosition()

    await act(() => {
      fake.firePosition(position)
    })

    expect(result.current.coords.latitude).toBe(51.5)
    expect(result.current.coords.longitude).toBe(-0.12)
    expect(result.current.coords.accuracy).toBe(10)
    expect(result.current.locatedAt).toBe(position.timestamp)
    expect(result.current.error).toBeNull()
  })

  it('captures the error and clears it on the next successful update', async () => {
    const fake = createFakeGeolocation()
    const { result, act } = await renderHook(() => useGeolocation({ navigator: fake.fakeNavigator }))

    const positionError = {
      code: 1,
      message: 'permission denied',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError

    await act(() => {
      fake.fireError(positionError)
    })
    expect(result.current.error).toBe(positionError)

    await act(() => {
      fake.firePosition(makePosition())
    })
    expect(result.current.error).toBeNull()
  })

  it('pause clears the watch and resume restarts it', async () => {
    const fake = createFakeGeolocation()
    const { result, act } = await renderHook(() => useGeolocation({ navigator: fake.fakeNavigator }))

    expect(fake.geolocation.watchPosition).toHaveBeenCalledTimes(1)
    const firstId = fake.geolocation.watchPosition.mock.results[0].value

    // while paused no updates arrive
    await act(() => {
      result.current.pause()
    })
    expect(fake.geolocation.clearWatch).toHaveBeenCalledWith(firstId)
    expect(result.current.locatedAt).toBeNull()

    await act(() => {
      fake.firePosition(makePosition({ timestamp: 1 }))
    })
    expect(result.current.locatedAt).toBeNull()

    // resuming starts a fresh watch that delivers positions again
    await act(() => {
      result.current.resume()
    })
    expect(fake.geolocation.watchPosition).toHaveBeenCalledTimes(2)

    await act(() => {
      fake.firePosition(makePosition({ timestamp: 2 }))
    })
    expect(result.current.locatedAt).toBe(2)
  })

  it('supports immediate: false and manual resume', async () => {
    const fake = createFakeGeolocation()
    const { result, act } = await renderHook(() => useGeolocation({
      navigator: fake.fakeNavigator,
      immediate: false,
    }))

    expect(fake.geolocation.watchPosition).not.toHaveBeenCalled()

    await act(() => {
      result.current.resume()
    })
    expect(fake.geolocation.watchPosition).toHaveBeenCalledTimes(1)
  })

  it('clears the watch on unmount', async () => {
    const fake = createFakeGeolocation()
    const { result, unmount } = await renderHook(() => useGeolocation({ navigator: fake.fakeNavigator }))

    const firstId = fake.geolocation.watchPosition.mock.results[0].value
    unmount()

    expect(fake.geolocation.clearWatch).toHaveBeenCalledWith(firstId)
    expect(result.current.locatedAt).toBeNull()
  })

  it('keeps SSR-safe defaults during render and resolves in a mount effect', async () => {
    const values: UseGeolocationReturn[] = []
    const fake = createFakeGeolocation()

    function Probe() {
      const state = useGeolocation({ navigator: fake.fakeNavigator })
      values.push(state)

      return <div>{state.isSupported ? 'supported' : 'unsupported'}</div>
    }

    const screen = await render(<Probe />)

    // render-time values are the SSR-safe defaults
    expect(values[0].isSupported).toBe(false)
    expect(values[0].coords).toEqual(DEFAULT_COORDS)
    expect(values[0].locatedAt).toBeNull()
    expect(values[0].error).toBeNull()

    // the mount effect probes navigator and re-renders
    await expect.element(screen.getByText('supported')).toBeVisible()
    expect(values[values.length - 1].isSupported).toBe(true)
  })
})
