import type { BatteryManager } from '../useBattery'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useBattery } from '../useBattery'

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
