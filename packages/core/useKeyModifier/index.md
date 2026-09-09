---
category: Sensors
---

# useKeyModifier

Reactive [Modifier State](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState). Tracks state of any of the [supported modifiers](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState#browser_compatibility)

## Usage

```tsx
import { useKeyModifier } from '@reaxuse/core'

const capsLockState = useKeyModifier('CapsLock') // boolean | null

console.log(capsLockState)
```

## Events

You can customize which events will prompt the state to update. By default, these are `mouseup`, `mousedown`, `keyup`, `keydown`. To customize these events:

```tsx
import { useKeyModifier } from '@reaxuse/core'

const capsLockState = useKeyModifier('CapsLock', { events: ['mouseup', 'mousedown'] })

console.log(capsLockState) // null

// Caps Lock turned on with key press
console.log(capsLockState) // null

// Mouse button clicked
console.log(capsLockState) // true
```

## Initial State

By default, the returned state is `null` until the first event is received. You can explicitly pass the initial state to it via:

```tsx
import { useKeyModifier } from '@reaxuse/core'

const capsLockState1 = useKeyModifier('CapsLock') // boolean | null
const capsLockState2 = useKeyModifier('CapsLock', { initial: false }) // boolean
```
