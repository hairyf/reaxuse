---
category: Sensors
---

# useLongPress

Listen for a long press on an element. Returns a stop function.

## Usage

```tsx
import { useLongPress } from '@reaxuse/core'
import { useRef, useState } from 'react'

const htmlRefHook = useRef<HTMLButtonElement | null>(null)
const [longPressedHook, setLongPressedHook] = useState(false)

function onLongPressCallbackHook(e: PointerEvent) {
  setLongPressedHook(true)
}
function resetHook() {
  setLongPressedHook(false)
}

useLongPress(
  htmlRefHook,
  onLongPressCallbackHook,
  {
    modifiers: {
      prevent: true,
    },
  },
)

return (
  <>
    <p>
      Long Pressed:
      {longPressedHook ? 'true' : 'false'}
    </p>

    <button ref={htmlRefHook} className="ml-2 button small">
      Press long
    </button>

    <button className="ml-2 button small" onClick={resetHook}>
      Reset
    </button>
  </>
)
```

### Return Value

Returns a stop function that clears any pending long-press timer and removes the event listeners.

```tsx
const target = useRef<HTMLButtonElement | null>(null)
const stop = useLongPress(target, handler)

// Later, stop listening
stop()
```

### Custom Delay

By default, the handler fires after 500ms. You can customize this with the `delay` option. It can be a number or a function that receives the `PointerEvent`.

```tsx
import { useLongPress } from '@reaxuse/core'

// Fixed delay
useLongPress(target, handler, { delay: 1000 })

// Dynamic delay based on event
useLongPress(target, handler, {
  delay: ev => ev.pointerType === 'touch' ? 800 : 500,
})
```

### Distance Threshold

The long press will be canceled if the pointer moves more than the threshold (default: 10 pixels). Set to `false` to disable movement detection.

```tsx
import { useLongPress } from '@reaxuse/core'

// Custom threshold
useLongPress(target, handler, { distanceThreshold: 20 })

// Disable movement detection
useLongPress(target, handler, { distanceThreshold: false })
```

### On Mouse Up Callback

You can provide an `onMouseUp` callback to be notified when the pointer is released.

```tsx
import { useLongPress } from '@reaxuse/core'

useLongPress(target, handler, {
  onMouseUp(duration, distance, isLongPress, pointerEvent) {
    console.log(`Held for ${duration}ms, moved ${distance}px, long press: ${isLongPress}, x: ${pointerEvent.clientX}`)
  },
})
```

### Modifiers

The following modifiers are available:

| Modifier  | Description                                  |
| --------- | -------------------------------------------- |
| `stop`    | Calls `event.stopPropagation()`              |
| `once`    | Removes event listener after first trigger   |
| `prevent` | Calls `event.preventDefault()`               |
| `capture` | Uses capture mode for event listener         |
| `self`    | Only trigger if target is the element itself |

```tsx
useLongPress(target, handler, {
  modifiers: {
    prevent: true,
    stop: true,
  },
})
```
