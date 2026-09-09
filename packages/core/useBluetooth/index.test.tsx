import type { Mock } from 'vitest'
import type { BluetoothDevice } from '../useBluetooth'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useBluetooth } from '../useBluetooth'

function createMockBluetoothDevice(id: string) {
  const disconnectListeners = new Set<() => void>()
  const gatt = {
    connect: vi.fn(async () => ({
      connected: true,
    })),
    disconnect: vi.fn(),
  }

  const device = {
    id,
    gatt,
    addEventListener: vi.fn((event: string, listener: () => void) => {
      if (event === 'gattserverdisconnected')
        disconnectListeners.add(listener)
    }),
    removeEventListener: vi.fn((event: string, listener: () => void) => {
      if (event === 'gattserverdisconnected')
        disconnectListeners.delete(listener)
    }),
    dispatchDisconnect: () => {
      disconnectListeners.forEach(listener => listener())
    },
    get disconnectListenerCount() {
      return disconnectListeners.size
    },
  }

  return device as unknown as BluetoothDevice & {
    gatt: { connect: Mock, disconnect: Mock }
    dispatchDisconnect: () => void
    disconnectListenerCount: number
  }
}

function createMockNavigator(devices: ReturnType<typeof createMockBluetoothDevice>[]) {
  let index = 0
  return {
    bluetooth: {
      requestDevice: vi.fn(async () => devices[index++]),
    },
  } as unknown as Navigator
}

describe('useBluetooth', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(useBluetooth).toBeDefined()
  })

  it('should not accumulate gattserverdisconnected listeners across device changes', async () => {
    const device1 = createMockBluetoothDevice('device-1')
    const device2 = createMockBluetoothDevice('device-2')
    const navigator = createMockNavigator([device1, device2])

    const { result } = await renderHook(() => useBluetooth({ navigator }))

    await result.current.requestDevice()
    await result.current.requestDevice()

    await expect.poll(() => device1.disconnectListenerCount).toBe(0)
    await expect.poll(() => device2.disconnectListenerCount).toBe(1)

    // let the auto-connect for device2 settle before simulating the disconnect
    await expect.poll(() => result.current.isConnected).toBe(true)

    device2.dispatchDisconnect()
    await expect.poll(() => result.current.isConnected).toBe(false)
    await expect.poll(() => result.current.device).toBeUndefined()
  })

  it('should update server and connection state after connecting', async () => {
    const device = createMockBluetoothDevice('device-1')
    const navigator = createMockNavigator([device])

    const { result } = await renderHook(() => useBluetooth({ navigator }))

    await result.current.requestDevice()

    await expect.poll(() => result.current.server).toBeDefined()
    await expect.poll(() => result.current.isConnected).toBe(true)
  })

  it('disconnects the GATT server on unmount', async () => {
    const device = createMockBluetoothDevice('device-1')
    const navigator = createMockNavigator([device])

    const { result, unmount } = await renderHook(() => useBluetooth({ navigator }))

    await result.current.requestDevice()
    await expect.poll(() => result.current.isConnected).toBe(true)

    unmount()
    expect(device.gatt.disconnect).toHaveBeenCalled()
  })
})
