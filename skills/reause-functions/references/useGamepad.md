---
category: Browser
---

# useGamepad

Provides reactive bindings for the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API).

## Usage

> Due to how the Gamepad API works, you must interact with the page using the gamepad before it will be detected.

```tsx
import { useGamepad } from '@reause/core'

const [gamepads, setGamepads, { isSupported }] = useGamepad()
const gamepad = gamepads.find(g => g.mapping === 'standard')
```

### Gamepad Updates

Currently the Gamepad API does not have event support to update the state of the gamepad. To update the gamepad state, `requestAnimationFrame` is used to poll for gamepad changes. You can control this polling by using the `pause` and `resume` functions provided by `useGamepad`

```tsx
import { useGamepad } from '@reause/core'

const [gamepads, , { pause, resume }] = useGamepad()

pause()

// gamepads object will not update

resume()

// gamepads object will update on user input
```

### Gamepad Connect & Disconnect Events

The `onConnected` and `onDisconnected` events will trigger when a gamepad is connected or disconnected.

```tsx
import { useGamepad } from '@reause/core'

const [gamepads, , { onConnected, onDisconnected }] = useGamepad()

onConnected((index) => {
  console.log(`${gamepads[index].id} connected`)
})

onDisconnected((index) => {
  console.log(`${index} disconnected`)
})
```

### Vibration

> The Gamepad Haptics API is sparse, so check the [compatibility table](https://developer.mozilla.org/en-US/docs/Web/API/GamepadHapticActuator#browser_compatibility) before using.

```tsx
import { useGamepad } from '@reause/core'

const [gamepads] = useGamepad()
const gamepad = gamepads[0]!

const supportsVibration = gamepad.hapticActuators.length > 0
function vibrate() {
  if (supportsVibration) {
    const actuator = gamepad.hapticActuators[0]
    actuator.playEffect('dual-rumble', {
      startDelay: 0,
      duration: 1000,
      weakMagnitude: 1,
      strongMagnitude: 1,
    })
  }
}
```

### Mappings

To make the Gamepad API easier to use, we provide mappings to map a controller to a controllers button layout.

#### Xbox360 Controller

```tsx
import { mapGamepadToXbox360Controller } from '@reause/core'

const [gamepads] = useGamepad()
const gamepad = gamepads[0]
const controller = mapGamepadToXbox360Controller(gamepad)

// controller is null until a gamepad is connected
console.log(controller?.buttons.a.pressed)
console.log(controller?.buttons.b.pressed)
console.log(controller?.buttons.x.pressed)
console.log(controller?.buttons.y.pressed)
```

Currently there are only mappings for the Xbox 360 controller. If you have controller you want to add mappings for, feel free to open a PR for more controller mappings!

## Return Values

The return is a React tuple `[gamepads, setGamepads, controls]` — upstream returns the object
`{ isSupported, onConnected, onDisconnected, gamepads: Ref<Gamepad[]>, pause, resume, isActive }`.

- `gamepads` — the current snapshot of connected gamepads, refreshed by the `requestAnimationFrame`
  poller (upstream: a writable `gamepads` ref).
- `setGamepads(next | prev => next)` — replaces the snapshot with the React immutable-update protocol.
  It also refreshes the internal latest-value ref synchronously, so the poller and the
  connect/disconnect handlers always build on the newest list.
- `controls.isSupported` — `true` when the resolved navigator exposes `getGamepads` (plain boolean,
  resolved in a mount effect, so it stays `false` on the first render and on the server).
- `controls.onConnected(fn)` / `controls.onDisconnected(fn)` — subscribe to the connect/disconnect
  events; each returns an `off` handle to unsubscribe (upstream: `createEventHook()`).
- `controls.pause()` / `controls.resume()` — control the `requestAnimationFrame` poller.
- `controls.isActive` — `true` while the poller is running (upstream `useRafFn`'s `isActive`
  shallow ref as a plain boolean).

The `controls` object keeps a stable identity while its members are unchanged.

## Type Declarations

```ts
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
/**
 * Reactive companion members of `useGamepad` — the React replacement for the
 * upstream event hooks, `Pausable` controls and `isSupported` ref.
 */
export interface UseGamepadControls {
  /**
   * `true` when the resolved navigator exposes `getGamepads`. Resolved in a
   * mount effect, so it stays `false` during the first render and on the
   * server (SSR-safe).
   */
  isSupported: boolean
  /**
   * Register a callback fired with the `index` of a newly connected gamepad.
   * Returns an `off` handle to unsubscribe — compatible with the
   * `useListener` protocol.
   */
  onConnected: (fn: (index: number) => void) => {
    off: () => void
  }
  /**
   * Register a callback fired with the `index` of a disconnected gamepad.
   * Returns an `off` handle to unsubscribe — compatible with the
   * `useListener` protocol.
   */
  onDisconnected: (fn: (index: number) => void) => {
    off: () => void
  }
  /**
   * Pause the `requestAnimationFrame` poller — the `gamepads` snapshot stops
   * updating.
   */
  pause: () => void
  /**
   * Resume the `requestAnimationFrame` poller.
   */
  resume: () => void
  /**
   * `true` while the `requestAnimationFrame` poller is running (upstream
   * `useRafFn`'s `isActive` shallow ref as a plain boolean). It starts
   * `false` and flips to `true` the first time a gamepad connects.
   */
  isActive: boolean
}
/**
 * The Xbox 360 controller button/axis layout produced by
 * `mapGamepadToXbox360Controller` from a standard-mapping gamepad.
 */
export interface Xbox360Controller {
  buttons: {
    a: GamepadButton
    b: GamepadButton
    x: GamepadButton
    y: GamepadButton
  }
  bumper: {
    left: GamepadButton
    right: GamepadButton
  }
  triggers: {
    left: GamepadButton
    right: GamepadButton
  }
  stick: {
    left: {
      horizontal: number
      vertical: number
      button: GamepadButton
    }
    right: {
      horizontal: number
      vertical: number
      button: GamepadButton
    }
  }
  dpad: {
    up: GamepadButton
    down: GamepadButton
    left: GamepadButton
    right: GamepadButton
  }
  back: GamepadButton
  start: GamepadButton
}
/**
 * Map a standard-mapping gamepad to an Xbox 360 Controller layout.
 *
 * Map from @vueuse/core `mapGamepadToXbox360Controller`
 * (`source/vueuse/packages/core/useGamepad/`). React divergence: upstream
 * takes a `Ref<Gamepad | undefined>` and returns a `ComputedRef`; here the
 * gamepad is a plain value and the mapped layout (or `null` when no gamepad
 * is passed) is returned directly.
 */
export declare function mapGamepadToXbox360Controller(
  gamepad: Gamepad | undefined,
): Xbox360Controller | null
/**
 * React return type: `[gamepads, setGamepads, controls]` — the state-like
 * tuple family used by `useStateWithControl` and `useStorage`. `gamepads` is
 * the plain `Gamepad[]` snapshot (upstream: a writable `Ref<Gamepad[]>`) and
 * `setGamepads` is the React setter for it.
 */
export type UseGamepadReturn = readonly [
  gamepads: Gamepad[],
  setGamepads: Dispatch<SetStateAction<Gamepad[]>>,
  controls: UseGamepadControls,
]
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
 * - the return is the React tuple `[gamepads, setGamepads, controls]` instead
 *   of upstream's object `{ isSupported, onConnected, onDisconnected,
 *   gamepads: Ref<Gamepad[]>, pause, resume, isActive }`. `gamepads` is plain
 *   state and `setGamepads` follows the React immutable-update protocol —
 *   `setGamepads(next)` or `setGamepads(prev => next)` — replacing upstream's
 *   writable `gamepads` ref. `setGamepads` refreshes the internal latest-value
 *   ref synchronously, so the rAF poller and the connect/disconnect handlers
 *   always build on the newest list;
 * - the Vue `gamepads` ref becomes a plain `Gamepad[]` state refreshed by an
 *   rAF poller (upstream `updateGamepadState`), so read it directly from the
 *   first tuple slot instead of `.value`;
 * - upstream's `createEventHook()` on* members become stable subscribe
 *   functions with the same `(fn) => { off }` shape, managed with Sets, so
 *   they are identity-stable across renders and compatible with the
 *   `useListener` protocol; the Sets are cleared on unmount (upstream:
 *   `tryOnScopeDispose` inside `createEventHook`'s `on`);
 * - `isSupported` (upstream `useSupported`) is a plain boolean resolved in
 *   the mount effect — nothing touches `navigator` during render (SSR-safe);
 * - `isActive` (upstream `useRafFn`'s shallow ref, missing from the earlier
 *   reause port) is a plain boolean in `controls`;
 * - the polling loop starts paused (`useRafFn` with `immediate: false`,
 *   mirroring upstream's post-setup `pause()`) and is resumed the first time
 *   a gamepad connects; disconnecting never pauses it, matching upstream;
 * - the `gamepadconnected` / `gamepaddisconnected` listeners register via
 *   `useEventListener` (window target) and the initial `getGamepads()` poll
 *   (upstream `tryOnMounted`) runs in a mount effect.
 *
 * @example
 * const [gamepads, setGamepads, { isSupported, onConnected, pause, resume }] = useGamepad()
 * const gamepad = gamepads.find(g => g.mapping === 'standard')
 *
 * useListener(onConnected, (index) => console.log(`${gamepad.id} connected`))
 */
export declare function useGamepad(
  options?: UseGamepadOptions,
): UseGamepadReturn
```
