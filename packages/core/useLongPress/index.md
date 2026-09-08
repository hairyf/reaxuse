---
category: Sensors
---

# useLongPress

Listen for a long press on an element. Returns a stop function.

**Mapping:** React port of VueUse's [`onLongPress`](https://vueuse.org/core/onLongPress/) — the pointer listeners
are registered in a mount effect and removed on unmount (upstream is a plain function). The `threshold`
option (upstream's `delay`) controls how long the pointer must stay pressed, and `distanceThreshold`
(upstream default: 10px, `false` disables it) cancels the press when the pointer moves too far.
Upstream's single `onMouseUp` release callback is split into `onFinish` (pointer released after the long
press fired) and `onCancel` (released or user-agent-canceled before it fired, or moved and thereby
canceled), and `modifiers` filter on keyboard modifier keys (`ctrl` / `shift` / `alt` / `meta`) instead of
upstream's event-manipulation flags (`prevent` / `stop` / `self` / `once` / `capture`), which have no
stable React equivalent. Like upstream, calling the hook returns a stop function (`() => void`) that
clears any pending long-press timer and removes the currently registered listeners.

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

<DemoContainer name="UseLongPress" />

## Type Declarations

```ts
export interface UseLongPressModifiers {
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
}

export interface UseLongPressOptions {
  /**
   * Time in ms till `longpress` gets called
   *
   * @default 500
   */
  threshold?: number
  modifiers?: UseLongPressModifiers
  /**
   * Allowance of moving distance in pixels,
   * the action will get canceled when moving too far from the pointerdown position.
   *
   * @default 10
   */
  distanceThreshold?: number | false
  onStart?: (pointerEvent: PointerEvent) => void
  onFinish?: (pointerEvent: PointerEvent) => void
  onCancel?: (pointerEvent: PointerEvent) => void
}

// Listen for a long press on an element. Returns a stop function (`() => void`).
export function useLongPress(
  target: RefOrValue<EventTarget | null | undefined>,
  handler: (evt: PointerEvent) => void,
  options?: UseLongPressOptions,
): () => void
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/onLongPress/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/onLongPress/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/onLongPress/index.test.ts) (mirrored by `useLongPress.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/onLongPress/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useLongPress.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useLongPress.ts), docs + demo co-located in `packages/core/useLongPress/`

<Contributors name="useLongPress" />
