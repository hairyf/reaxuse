---
category: Browser
---

# useGamepad

Provides reactive bindings for the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API)

## Usage

> Due to how the Gamepad API works, you must interact with the page using the gamepad before it will be detected.

```tsx
import { useGamepad } from '@reaxuse/core'

const { isSupported, gamepads } = useGamepad()
const gamepad = gamepads.find(g => g.mapping === 'standard')
```

## Gamepad Updates

Currently the Gamepad API does not have event support to update the state of the gamepad. To update the gamepad state, `requestAnimationFrame` is used to poll for gamepad changes. You can control this polling by using the `pause` and `resume` functions provided by `useGamepad`.

```tsx
import { useGamepad } from '@reaxuse/core'

const { pause, resume, gamepads } = useGamepad()

pause()

// gamepads object will not update

resume()

// gamepads object will update on user input
```

## Gamepad Connect & Disconnect Events

The `onConnected` and `onDisconnected` events will trigger when a gamepad is connected or disconnected.

```tsx
import { useGamepad } from '@reaxuse/core'
import { useListener } from '@reaxuse/shared'

const { gamepads, onConnected, onDisconnected } = useGamepad()

useListener(onConnected, (index) => {
  console.log(`${gamepads[index].id} connected`)
})

useListener(onDisconnected, (index) => {
  console.log(`${index} disconnected`)
})
```

The returned `onConnected` / `onDisconnected` are stable registration functions following the `useListener` protocol — each accepts a callback and returns an `off` handle, so listeners never leak and never fire after the component unmounts:

```tsx
const { onConnected } = useGamepad()

const { off } = onConnected(index => console.log(`${index} connected`))
// later: off() unsubscribes
```

## Vibration

> The Gamepad Haptics API is sparse, so check the [compatibility table](https://developer.mozilla.org/en-US/docs/Web/API/GamepadHapticActuator#browser_compatibility) before using.

```tsx
import { useGamepad } from '@reaxuse/core'

const { gamepads } = useGamepad()
const gamepad = gamepads[0]

if (gamepad) {
  const supportsVibration = gamepad.hapticActuators.length > 0
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
