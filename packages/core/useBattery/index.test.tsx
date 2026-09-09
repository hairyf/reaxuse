import type { BatteryManager } from '../useBattery'
import { afterEach, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useBattery } from '../useBattery'

afterEach(() => {
  vi.unstubAllGlobals()
})

interface FakeBatteryState {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
}

const batteryEvents = ['chargingchange', 'chargingtimechange', 'dischargingtimechange', 'levelchange']

function createFakeBattery(initial: Partial<FakeBatteryState> = {}): {
  battery: BatteryManager
  state: FakeBatteryState
  trigger: (type: string) => void
  listenerCount: () => number
} {
  const state: FakeBatteryState = {
    charging: false,
    chargingTime: 0,
    dischargingTime: 0,
    level: 1,
    ...initial,
  }
  const listeners: Record<string, Array<() => void>> = {}

  // `BatteryManager` relies on getters on the live object, so the fake
  // exposes a mutable `state` and reads through property getters.
  const battery = {
    get charging() { return state.charging },
    get chargingTime() { return state.chargingTime },
    get dischargingTime() { return state.dischargingTime },
    get level() { return state.level },
    addEventListener: (type: string, listener: () => void) => {
      (listeners[type] ||= []).push(listener)
    },
    removeEventListener: (type: string, listener: () => void) => {
      listeners[type] = (listeners[type] ?? []).filter(item => item !== listener)
    },
    dispatchEvent: () => false,
  } as unknown as BatteryManager

  return {
    battery,
    state,
    trigger: (type: string) => (listeners[type] ?? []).forEach(listener => listener()),
    listenerCount: () => Object.values(listeners).reduce((sum, list) => sum + list.length, 0),
  }
}

function createFakeNavigator(battery?: BatteryManager): Navigator {
  return {
    ...(battery ? { getBattery: () => Promise.resolve(battery) } : {}),
  } as unknown as Navigator
}

// Wraps the real `navigator` so that unrelated consumers (React DOM, the
// browser test harness) still read `userAgent`, `clipboard`, … while
// `getBattery` resolves to the fake manager — replacing the global with a
// plain object would break them.
function createGlobalNavigatorStub(battery: BatteryManager): Navigator {
  return new Proxy(window.navigator, {
    has: (target, prop) => prop === 'getBattery' || prop in target,
    get: (target, prop) => (prop === 'getBattery'
      ? () => Promise.resolve(battery)
      : Reflect.get(target, prop, target)),
  }) as Navigator
}

it('useBattery reads the initial battery state once mounted', async () => {
  const { battery } = createFakeBattery({ charging: true, chargingTime: 60, dischargingTime: 120, level: 0.5 })
  const navigator = createFakeNavigator(battery)

  const { result } = await renderHook(() => useBattery({ navigator }))

  expect(result.current).toEqual({
    isSupported: true,
    charging: true,
    chargingTime: 60,
    dischargingTime: 120,
    level: 0.5,
  })
})

it('useBattery updates its state on battery events', async () => {
  const { battery, state, trigger } = createFakeBattery({ level: 1 })
  const navigator = createFakeNavigator(battery)
  const { result, act } = await renderHook(() => useBattery({ navigator }))

  state.charging = true
  await act(() => {
    trigger('chargingchange')
  })
  expect(result.current.charging).toBe(true)

  state.level = 0.25
  await act(() => {
    trigger('levelchange')
  })
  expect(result.current.level).toBe(0.25)

  state.chargingTime = 30
  state.dischargingTime = 90
  await act(() => {
    trigger('chargingtimechange')
    trigger('dischargingtimechange')
  })
  expect(result.current.chargingTime).toBe(30)
  expect(result.current.dischargingTime).toBe(90)
})

it('useBattery falls back to 0 when the battery reports 0 times', async () => {
  const { battery } = createFakeBattery({ chargingTime: 0, dischargingTime: 0 })
  const navigator = createFakeNavigator(battery)

  const { result } = await renderHook(() => useBattery({ navigator }))

  expect(result.current).toEqual({
    isSupported: true,
    charging: false,
    chargingTime: 0,
    dischargingTime: 0,
    level: 1,
  })
})

it('useBattery returns the defaults when the navigator lacks getBattery', async () => {
  const navigator = createFakeNavigator()

  const { result } = await renderHook(() => useBattery({ navigator }))

  expect(result.current).toEqual({
    isSupported: false,
    charging: false,
    chargingTime: 0,
    dischargingTime: 0,
    level: 1,
  })
})

it('useBattery stays SSR-safe during render before the mount effect', async () => {
  const { battery } = createFakeBattery()
  const navigator = createFakeNavigator(battery)
  const snapshots: Array<ReturnType<typeof useBattery>> = []

  function Probe() {
    const batteryState = useBattery({ navigator })

    snapshots.push(batteryState)

    return <div>{batteryState.isSupported ? 'supported' : 'unsupported'}</div>
  }

  await render(<Probe />)

  expect(snapshots[0]).toEqual({
    isSupported: false,
    charging: false,
    chargingTime: 0,
    dischargingTime: 0,
    level: 1,
  })
})

it('useBattery removes its battery listeners on unmount', async () => {
  const { battery, listenerCount, trigger } = createFakeBattery()
  const navigator = createFakeNavigator(battery)
  const { result, unmount } = await renderHook(() => useBattery({ navigator }))

  expect(listenerCount()).toBe(batteryEvents.length)
  unmount()

  expect(listenerCount()).toBe(0)
  expect(() => {
    trigger('chargingchange')
  }).not.toThrow()
  expect(result.current.charging).toBe(false)
})

it('useBattery falls back to the global navigator when no options are given', async () => {
  const { battery } = createFakeBattery({ charging: true, chargingTime: 30, dischargingTime: 90, level: 0.4 })
  vi.stubGlobal('navigator', createGlobalNavigatorStub(battery))

  const { result } = await renderHook(() => useBattery())

  expect(result.current).toEqual({
    isSupported: true,
    charging: true,
    chargingTime: 30,
    dischargingTime: 90,
    level: 0.4,
  })
})

it('useBattery keeps the defaults when getBattery rejects', async () => {
  // The implementation mirrors upstream and attaches no rejection handler, so
  // the browser reports the rejection as unhandled. Listen for it here so the
  // browser-mode harness does not treat it as an unexpected error, then pin
  // what the hook guarantees: a rejected acquisition leaves the defaults.
  const onUnhandledRejection = (event: PromiseRejectionEvent) => event.preventDefault()
  window.addEventListener('unhandledrejection', onUnhandledRejection)

  try {
    const getBattery = vi.fn(() => Promise.reject(new Error('Battery Status API is not supported')))
    const navigator = { getBattery } as unknown as Navigator

    const { result } = await renderHook(() => useBattery({ navigator }))
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(getBattery).toHaveBeenCalledTimes(1)
    expect(result.current).toEqual({
      isSupported: true,
      charging: false,
      chargingTime: 0,
      dischargingTime: 0,
      level: 1,
    })
  }
  finally {
    window.removeEventListener('unhandledrejection', onUnhandledRejection)
  }
})

it('useBattery ignores a battery manager acquired after unmount', async () => {
  const { battery, listenerCount } = createFakeBattery()
  let resolveBattery: (manager: BatteryManager) => void = () => {}
  const navigator = {
    getBattery: () => new Promise<BatteryManager>((resolve) => {
      resolveBattery = resolve
    }),
  } as unknown as Navigator

  const { unmount } = await renderHook(() => useBattery({ navigator }))
  unmount()
  resolveBattery(battery)
  await new Promise(resolve => setTimeout(resolve, 0))

  // The `disposed` guard stops the late manager from being wired up.
  expect(listenerCount()).toBe(0)
})
