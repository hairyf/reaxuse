---
category: Sensors
---

# useLongPress

Listen for a long press on an element. Returns a stop function.

## Usage

```tsx
import { useLongPress } from '@reaxuse/core'

const target = useRef<HTMLButtonElement | null>(null)
const [longPressed, setLongPressed] = useState(false)

useLongPress(target, () => {
  setLongPressed(true)
})

// Make sure the returned stop function isn't used in the same render:
// const stop = useLongPress(target, handler)
```

### Return Value

Returns a stop function that clears any pending long-press timer and removes the event listeners.

```tsx
const target = useRef<HTMLButtonElement | null>(null)
const stop = useLongPress(target, handler)

// Later, stop listening
stop()
```

### Custom Threshold

By default, the handler fires after 500ms. You can customize this with the `threshold` option.

```tsx
useLongPress(target, handler, { threshold: 1000 })
```

### Distance Threshold

The long press will be canceled if the pointer moves more than the threshold (default: 10 pixels).
Set to `false` to disable movement detection.

```tsx
// Custom threshold
useLongPress(target, handler, { distanceThreshold: 20 })

// Disable movement detection
useLongPress(target, handler, { distanceThreshold: false })
```

### Press Lifecycle Callbacks

`onStart` is called when the pointer is pressed down, `onFinish` when the pointer is released after
the long press has fired, and `onCancel` when the pointer is released (or canceled by the browser,
e.g. a second pointer starting a pinch) before the threshold, or when it moves beyond
`distanceThreshold` while the press is pending.

```tsx
useLongPress(target, handler, {
  onStart(event) {
    console.log('Pressed', event)
  },
  onFinish(event) {
    console.log('Long press finished', event)
  },
  onCancel(event) {
    console.log('Press canceled', event)
  },
})
```

### Modifiers

You can require keyboard modifier keys to be held for the long press to be detected. Only the listed
keys are checked — `true` requires the key to be held down, `false` requires it to be released.

```tsx
useLongPress(target, handler, {
  modifiers: {
    ctrl: true,
  },
})
```

This only triggers the long press when the pointer is pressed while the `Ctrl` key is held.
