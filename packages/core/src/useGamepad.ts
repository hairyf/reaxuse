import type { ConfigurableWindow } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useEventListener } from './useEventListener'
import { useRafFn } from './useRafFn'
import { useSupported } from './useSupported'

/**
 * Options for `useGamepad`.
 *
 * The `navigator` option is inlined (not composed from a shared
 * `ConfigurableNavigator`) because other core hooks export a same-named type
 * — `export *` in `index.ts` would collide (TS2308), so like `useWakeLock`
 * this module declares the member directly.
 */
export interface UseGamepadOptions extends ConfigurableWindow {
  /**
   * Specify a custom `navigator` instance, e.g. working with iframes or in
   * testing environments.
   *
   * @default typeof navigator !== 'undefined' ? navigator : undefined
   */
  navigator?: Navigator
}

export interface UseGamepadReturn {
  /**
   * `true` when the resolved navigator exposes `getGamepads`. Resolved in a
   * mount effect, so it stays `false` during the first render and on the
   * server (SSR-safe).
   */
  isSupported: boolean
  /**
   * The current snapshot of connected gamepads, refreshed by a
   * `requestAnimationFrame` poller once a gamepad connects — `pause` /
   * `resume` control the polling.
   */
  gamepads: Gamepad[]
  /**
   * Register a callback fired with the `index` of a newly connected gamepad.
   * Returns an `off` handle to unsubscribe — compatible with the
   * `useListener` protocol.
   */
  onConnected: (fn: (index: number) => void) => { off: () => void }
  /**
   * Register a callback fired with the `index` of a disconnected gamepad.
   * Returns an `off` handle to unsubscribe — compatible with the
   * `useListener` protocol.
   */
  onDisconnected: (fn: (index: number) => void) => { off: () => void }
  /**
   * Pause the `requestAnimationFrame` poller — the `gamepads` snapshot stops
   * updating.
   */
  pause: () => void
  /**
   * Resume the `requestAnimationFrame` poller.
   */
  resume: () => void
}

/**
 * Normalize a raw `Gamepad` into a stable snapshot: arrays/buttons are copied
 * so later browser mutations of the same gamepad object don't leak into the
 * stored state, and the haptic actuators are collected.
 */
function stateFromGamepad(gamepad: Gamepad): Gamepad {
  const hapticActuators: GamepadHapticActuator[] = []
  const vibrationActuator = 'vibrationActuator' in gamepad ? (gamepad as Gamepad).vibrationActuator : null

  if (vibrationActuator)
    hapticActuators.push(vibrationActuator)

  // @ts-expect-error missing in types
  if (gamepad.hapticActuators)
    // @ts-expect-error missing in types
    hapticActuators.push(...gamepad.hapticActuators)

  return {
    id: gamepad.id,
    index: gamepad.index,
    connected: gamepad.connected,
    mapping: gamepad.mapping,
    timestamp: gamepad.timestamp,
    vibrationActuator: gamepad.vibrationActuator,
    hapticActuators,
    axes: gamepad.axes.map(axes => axes),
    buttons: gamepad.buttons.map(button => ({ pressed: button.pressed, touched: button.touched, value: button.value })),
  } as Gamepad
}

/**
 * React port of VueUse's `useGamepad`.
 *
 * Map from @vueuse/core `useGamepad`
 * (`source/vueuse/packages/core/useGamepad/`). Provides reactive bindings
 * for the Gamepad API — the `gamepads` snapshot, `onConnected` /
 * `onDisconnected` events and `pause` / `resume` control over the polling
 * loop.
 *
 * React divergences:
 * - the Vue `gamepads` ref becomes a plain `Gamepad[]` state refreshed by an
 *   rAF poller (upstream `updateGamepadState`), so read it directly off the
 *   result object instead of `.value`;
 * - upstream's `createEventHook()` on* members become stable subscribe
 *   functions with the same `(fn) => { off }` shape, managed with Sets, so
 *   they are identity-stable across renders and compatible with the
 *   `useListener` protocol; the Sets are cleared on unmount (upstream:
 *   `tryOnScopeDispose` inside `createEventHook`'s `on`);
 * - `isSupported` (upstream `useSupported`) is a plain boolean resolved in
 *   the mount effect — nothing touches `navigator` during render (SSR-safe);
 * - the polling loop starts paused (`useRafFn` with `immediate: false`,
 *   mirroring upstream's post-setup `pause()`) and is resumed the first time
 *   a gamepad connects; disconnecting never pauses it, matching upstream;
 * - the `gamepadconnected` / `gamepaddisconnected` listeners register via
 *   `useEventListener` (window target) and the initial `getGamepads()` poll
 *   (upstream `tryOnMounted`) runs in a mount effect.
 *
 * @example
 * const { isSupported, gamepads, onConnected, pause, resume } = useGamepad()
 * const gamepad = gamepads.find(g => g.mapping === 'standard')
 *
 * useListener(onConnected, (index) => console.log(`${gamepad.id} connected`))
 */
export function useGamepad(options: UseGamepadOptions = {}): UseGamepadReturn {
  const {
    navigator: customNavigator,
  } = options

  const [gamepads, setGamepads] = useState<Gamepad[]>([])

  // latest-value refs so the stable rAF callback and event handlers always
  // read the freshest state / navigator without re-subscribing
  const gamepadsRef = useRef<Gamepad[]>([])
  gamepadsRef.current = gamepads

  const navigatorRef = useRef<Navigator | undefined>(undefined)
  navigatorRef.current = customNavigator ?? (typeof navigator === 'undefined' ? undefined : navigator)

  const isSupported = useSupported(() => navigatorRef.current && 'getGamepads' in navigatorRef.current)

  // Event hooks: upstream `createEventHook()` — one stable subscribe
  // function per event, returning an `off` handle to unsubscribe.
  const onConnectedFns = useRef(new Set<(index: number) => void>())
  const onDisconnectedFns = useRef(new Set<(index: number) => void>())

  const onConnected = useCallback((fn: (index: number) => void) => {
    onConnectedFns.current.add(fn)
    return {
      off: () => {
        onConnectedFns.current.delete(fn)
      },
    }
  }, [])

  const onDisconnected = useCallback((fn: (index: number) => void) => {
    onDisconnectedFns.current.add(fn)
    return {
      off: () => {
        onDisconnectedFns.current.delete(fn)
      },
    }
  }, [])

  const triggerConnected = useCallback((index: number) => {
    onConnectedFns.current.forEach(fn => fn(index))
  }, [])

  const triggerDisconnected = useCallback((index: number) => {
    onDisconnectedFns.current.forEach(fn => fn(index))
  }, [])

  // rAF poller: refresh the snapshot of already-tracked gamepads every frame
  // (upstream `updateGamepadState`); starts paused and is resumed on connect.
  const updateGamepadState = useCallback(() => {
    const _gamepads = navigatorRef.current?.getGamepads() || []

    for (const gamepad of _gamepads) {
      if (!gamepad)
        continue

      const index = gamepadsRef.current.findIndex(x => x.index === gamepad.index)
      if (index > -1) {
        const next = [...gamepadsRef.current]
        next[index] = stateFromGamepad(gamepad)
        gamepadsRef.current = next
        setGamepads(next)
      }
    }
  }, [])

  const { pause, resume } = useRafFn(updateGamepadState, { immediate: false })

  const onGamepadConnected = useCallback((gamepad: Gamepad) => {
    if (!gamepadsRef.current.some(({ index }) => index === gamepad.index)) {
      const next = [...gamepadsRef.current, stateFromGamepad(gamepad)]
      gamepadsRef.current = next
      setGamepads(next)
      triggerConnected(gamepad.index)
    }

    resume()
  }, [resume, triggerConnected])

  const onGamepadDisconnected = useCallback((gamepad: Gamepad) => {
    const next = gamepadsRef.current.filter(x => x.index !== gamepad.index)
    gamepadsRef.current = next
    setGamepads(next)
    triggerDisconnected(gamepad.index)
  }, [triggerDisconnected])

  const onGamepadConnectedRef = useRef(onGamepadConnected)
  onGamepadConnectedRef.current = onGamepadConnected
  const onGamepadDisconnectedRef = useRef(onGamepadDisconnected)
  onGamepadDisconnectedRef.current = onGamepadDisconnected

  useEventListener('gamepadconnected', e => onGamepadConnectedRef.current(e.gamepad), { passive: true })
  useEventListener('gamepaddisconnected', e => onGamepadDisconnectedRef.current(e.gamepad), { passive: true })

  // initial poll for already-connected gamepads (upstream: `tryOnMounted`)
  useEffect(() => {
    const _gamepads = navigatorRef.current?.getGamepads() || []

    for (const gamepad of _gamepads) {
      if (gamepad && gamepadsRef.current[gamepad.index])
        onGamepadConnectedRef.current(gamepad)
    }
  }, [])

  // Unmount cleanup of the event subscriptions (upstream:
  // `tryOnScopeDispose` inside createEventHook's `on`).
  useEffect(() => {
    return () => {
      onConnectedFns.current.clear()
      onDisconnectedFns.current.clear()
    }
  }, [])

  return {
    isSupported,
    onConnected,
    onDisconnected,
    gamepads,
    pause,
    resume,
  }
}
