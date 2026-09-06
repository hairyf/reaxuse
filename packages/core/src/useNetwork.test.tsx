import type { NetworkInformation } from './useNetwork'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useNetwork } from './useNetwork'

interface FakeConnectionShape {
  downlink: number
  downlinkMax: number
  effectiveType: string
  rtt: number
  saveData: boolean
  type: string
}

function createFakeConnection(initial: Partial<FakeConnectionShape> = {}): {
  connection: NetworkInformation
  state: FakeConnectionShape
  trigger: (type: string) => void
} {
  const state: FakeConnectionShape = {
    downlink: 10,
    downlinkMax: 100,
    effectiveType: '4g',
    rtt: 50,
    saveData: false,
    type: 'wifi',
    ...initial,
  }
  const listeners: Record<string, Array<() => void>> = {}

  // `NetworkInformation` properties are readonly, so the fake exposes a
  // mutable `state` and the connection object reads through getters.
  const connection = {
    get downlink() { return state.downlink },
    get downlinkMax() { return state.downlinkMax },
    get effectiveType() { return state.effectiveType },
    get rtt() { return state.rtt },
    get saveData() { return state.saveData },
    get type() { return state.type },
    addEventListener: (type: string, listener: () => void) => {
      (listeners[type] ||= []).push(listener)
    },
    removeEventListener: (type: string, listener: () => void) => {
      listeners[type] = (listeners[type] ?? []).filter(item => item !== listener)
    },
    dispatchEvent: () => false,
  } as unknown as NetworkInformation

  return {
    connection,
    state,
    trigger: (type: string) => (listeners[type] ?? []).forEach(listener => listener()),
  }
}

function createFakeWindow(overrides: { onLine?: boolean, connection?: NetworkInformation } = {}): {
  win: Window
  listeners: Record<string, Array<() => void>>
} {
  const listeners: Record<string, Array<() => void>> = {}
  const navigator: Record<string, unknown> = { onLine: overrides.onLine ?? true }
  if (overrides.connection)
    navigator.connection = overrides.connection

  return {
    win: {
      navigator,
      addEventListener: (type: string, listener: () => void) => {
        (listeners[type] ||= []).push(listener)
      },
      removeEventListener: (type: string, listener: () => void) => {
        listeners[type] = (listeners[type] ?? []).filter(item => item !== listener)
      },
    } as unknown as Window,
    listeners,
  }
}

it('useNetwork reads the initial network state from navigator.connection', async () => {
  const { connection } = createFakeConnection()
  const { win } = createFakeWindow({ onLine: true, connection })

  const { result } = await renderHook(() => useNetwork({ window: win }))

  expect(result.current).toEqual({
    isSupported: true,
    isOnline: true,
    offlineAt: undefined,
    onlineAt: expect.any(Number),
    downlink: 10,
    downlinkMax: 100,
    effectiveType: '4g',
    saveData: false,
    rtt: 50,
    type: 'wifi',
  })
})

it('useNetwork records offlineAt when navigator reports offline on mount', async () => {
  const { connection } = createFakeConnection()
  const { win } = createFakeWindow({ onLine: false, connection })

  const { result } = await renderHook(() => useNetwork({ window: win }))

  expect(result.current.isSupported).toBe(true)
  expect(result.current.isOnline).toBe(false)
  expect(typeof result.current.offlineAt).toBe('number')
})

it('useNetwork flips isOnline on window online/offline events', async () => {
  const { win, listeners } = createFakeWindow({ onLine: true })
  const { result, act } = await renderHook(() => useNetwork({ window: win }))

  // without the Network Information API only the online state is reactive
  expect(result.current.isSupported).toBe(false)
  expect(result.current.isOnline).toBe(true)

  await act(() => {
    listeners.offline.forEach(listener => listener())
  })
  expect(result.current.isOnline).toBe(false)
  expect(typeof result.current.offlineAt).toBe('number')

  await act(() => {
    listeners.online.forEach(listener => listener())
  })
  expect(result.current.isOnline).toBe(true)
})

it('useNetwork updates connection properties on the connection change event', async () => {
  const { connection, state, trigger } = createFakeConnection()
  const { win } = createFakeWindow({ onLine: true, connection })
  const { result, act } = await renderHook(() => useNetwork({ window: win }))

  state.downlink = 1.5
  state.downlinkMax = 2
  state.effectiveType = '2g'
  state.saveData = true
  state.type = 'cellular'

  await act(() => {
    trigger('change')
  })

  expect(result.current).toMatchObject({
    isOnline: true,
    downlink: 1.5,
    downlinkMax: 2,
    effectiveType: '2g',
    saveData: true,
    type: 'cellular',
  })
})

it('useNetwork stays SSR-safe during render before the mount effect', async () => {
  const snapshots: Array<ReturnType<typeof useNetwork>> = []

  function Probe() {
    const state = useNetwork()

    snapshots.push(state)

    return <div>{state.isOnline ? 'online' : 'offline'}</div>
  }

  await render(<Probe />)

  expect(snapshots[0]).toEqual({
    isSupported: false,
    isOnline: true,
    offlineAt: undefined,
    onlineAt: undefined,
    downlink: undefined,
    downlinkMax: undefined,
    effectiveType: undefined,
    saveData: false,
    rtt: undefined,
    type: 'unknown',
  })
})

it('useNetwork reflects the real navigator.onLine once mounted', async () => {
  const { result } = await renderHook(() => useNetwork())

  expect(result.current.isOnline).toBe(navigator.onLine)
})

it('useNetwork removes its listeners on unmount', async () => {
  const { result, unmount } = await renderHook(() => useNetwork())
  unmount()

  expect(() => {
    window.dispatchEvent(new Event('offline'))
    window.dispatchEvent(new Event('online'))
  }).not.toThrow()

  expect(result.current.isOnline).toBe(navigator.onLine)
})
