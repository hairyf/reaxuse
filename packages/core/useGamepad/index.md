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
