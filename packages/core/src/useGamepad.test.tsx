import { useListener } from '@reaxuse/shared'
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useGamepad } from './useGamepad'

interface MockGamepad {
  id: string
  index: number
  connected: boolean
  mapping: GamepadMappingType
  timestamp: number
  vibrationActuator: GamepadHapticActuator | null
  hapticActuators: GamepadHapticActuator[]
  axes: number[]
  buttons: Array<{ pressed: boolean, touched: boolean, value: number }>
}

function createGamepad(index: number): MockGamepad {
  return {
    id: `gamepad-${index}`,
    index,
    connected: true,
    mapping: 'standard',
    timestamp: 0,
    vibrationActuator: null,
    hapticActuators: [],
    axes: [0, 0, 0, 0],
    buttons: [{ pressed: false, touched: false, value: 0 }],
  }
}

function dispatchGamepadEvent(type: 'gamepadconnected' | 'gamepaddisconnected', gamepad: MockGamepad) {
  const event = new Event(type)
  Object.assign(event, { gamepad })
  window.dispatchEvent(event)
}

describe('useGamepad', () => {
  it('keeps updating the remaining gamepad after another one disconnects', async () => {
    const pad0 = createGamepad(0)
    const pad1 = createGamepad(1)
    let connectedPads: MockGamepad[] = [pad0, pad1]
    const navigator = { getGamepads: () => connectedPads } as unknown as Navigator

    const { result } = await renderHook(() => useGamepad({ navigator }))

    dispatchGamepadEvent('gamepadconnected', pad0)
    dispatchGamepadEvent('gamepadconnected', pad1)

    await expect.poll(() => result.current.gamepads.map(g => g.index)).toEqual([0, 1])

    // pad0 disconnects, so pad1 is re-packed to array position 0
    dispatchGamepadEvent('gamepaddisconnected', pad0)
    connectedPads = [pad1]

    await expect.poll(() => result.current.gamepads.map(g => g.index)).toEqual([1])

    // pad1 reports new input on the next frame
    pad1.timestamp = 1000
    pad1.axes = [0.5, 0, 0, 0]
    pad1.buttons = [{ pressed: true, touched: true, value: 1 }]

    await vi.waitFor(() => {
      const survivor = result.current.gamepads.find(g => g.index === 1)!
      expect(survivor.timestamp).toBe(1000)
      expect(survivor.buttons[0].pressed).toBe(true)
    })
  })

  it('skips null slots returned by getGamepads', async () => {
    const pad = createGamepad(1)
    // browsers return a fixed-length array with null in the unused slots
    const connectedPads: Array<MockGamepad | null> = [null, pad]
    const navigator = { getGamepads: () => connectedPads } as unknown as Navigator

    const { result } = await renderHook(() => useGamepad({ navigator }))

    dispatchGamepadEvent('gamepadconnected', pad)

    await expect.poll(() => result.current.gamepads.map(g => g.index)).toEqual([1])

    // new input arrives on the next frame, alongside a null slot
    pad.timestamp = 1000
    pad.buttons = [{ pressed: true, touched: true, value: 1 }]

    await vi.waitFor(() => {
      const updated = result.current.gamepads.find(g => g.index === 1)!
      expect(updated.timestamp).toBe(1000)
      expect(updated.buttons[0].pressed).toBe(true)
    })
  })

  it('onConnected / onDisconnected fire through the useListener protocol', async () => {
    const pad = createGamepad(0)
    const connectedPads: MockGamepad[] = [pad]
    const navigator = { getGamepads: () => connectedPads } as unknown as Navigator

    const connected = vi.fn()
    const disconnected = vi.fn()
    const { unmount } = await renderHook(() => {
      const gamepad = useGamepad({ navigator })
      useListener(gamepad.onConnected, connected)
      useListener(gamepad.onDisconnected, disconnected)
      return gamepad
    })

    dispatchGamepadEvent('gamepadconnected', pad)
    expect(connected).toHaveBeenCalledTimes(1)
    expect(connected).toHaveBeenCalledWith(0)

    dispatchGamepadEvent('gamepaddisconnected', pad)
    expect(disconnected).toHaveBeenCalledTimes(1)
    expect(disconnected).toHaveBeenCalledWith(0)

    unmount()

    dispatchGamepadEvent('gamepadconnected', pad)
    dispatchGamepadEvent('gamepaddisconnected', pad)
    expect(connected).toHaveBeenCalledTimes(1)
    expect(disconnected).toHaveBeenCalledTimes(1)
  })
})
