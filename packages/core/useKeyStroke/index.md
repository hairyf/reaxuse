---
category: Sensors
---

# useKeyStroke

Listen for keyboard keystrokes. By default, listens on `keydown` events on `window`.

**Mapping:** React port of VueUse's [`onKeyStroke`](https://vueuse.org/core/onKeyStroke/) — the listener
is registered in a mount effect and removed on unmount (upstream is a plain function). The key filter
accepts a single key, an array of keys, `true` (any key) or a custom predicate, and the
`eventName` / `target` / `passive` / `dedupe` options are supported — `dedupe` may also be a ref-like
`{ current }` object, read on every received event. Like upstream, calling the hook returns
a stop function (`() => void`) that removes the currently registered listener. The upstream directive
variant (`v-on-key-stroke`) and the `onKeyDown` / `onKeyPressed` / `onKeyUp` shorthands are not part of
this port.

## Usage

```tsx
import { useKeyStroke } from '@reaxuse/core'

useKeyStroke('ArrowDown', (e) => {
  e.preventDefault()
})
```

See [this table](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) for all key codes.

### Return Value

Returns a stop function to remove the event listener.

```tsx
const stop = useKeyStroke('Escape', handler)

// Later, stop listening
stop()
```

### Listen To Multiple Keys

```tsx
useKeyStroke(['s', 'S', 'ArrowDown'], (e) => {
  e.preventDefault()
})

// listen to all keys by passing `true` or skipping the key parameter
useKeyStroke(true, (e) => {
  e.preventDefault()
})
useKeyStroke((e) => {
  e.preventDefault()
})
```

### Custom Key Predicate

You can pass a custom function to determine which keys should trigger the handler.

```tsx
useKeyStroke(
  e => e.key === 'A' && e.shiftKey,
  (e) => {
    console.log('Shift+A pressed')
  },
)
```

### Custom Event Target

```tsx
useKeyStroke('A', (e) => {
  console.log('Key A pressed on document')
}, { target: document })
```

### Ignore Repeated Events

The callback will trigger only once when pressing `A` and **holding down**. The `dedupe` option can also
be a ref-like `{ current }` object — it is read on every received event.

```tsx
useKeyStroke('A', (e) => {
  console.log('Key A pressed')
}, { dedupe: true })
```

Reference: [KeyboardEvent.repeat](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/repeat)

### Passive Mode

Set `passive: true` to use a passive event listener.

```tsx
useKeyStroke('A', handler, { passive: true })
```

### Custom Keyboard Event

```tsx
useKeyStroke('Shift', (e) => {
  console.log('Shift key up')
}, { eventName: 'keyup' })
```

<DemoContainer name="UseKeyStroke" />

## Type Declarations

```ts
export type KeyPredicate = (event: KeyboardEvent) => boolean
export type KeyFilter = true | string | string[] | KeyPredicate
export type KeyStrokeEventName = 'keydown' | 'keypress' | 'keyup'

export interface UseKeyStrokeOptions {
  eventName?: KeyStrokeEventName
  target?: RefOrValue<EventTarget | null | undefined>
  passive?: boolean
  /**
   * Set to `true` to ignore repeated events when the key is being held down.
   *
   * @default false
   */
  dedupe?: RefOrValue<boolean>
}

// Listen for keyboard keystrokes. Returns a stop function (`() => void`).
export function useKeyStroke(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options?: UseKeyStrokeOptions,
): () => void
export function useKeyStroke(
  handler: (event: KeyboardEvent) => void,
  options?: UseKeyStrokeOptions,
): () => void
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/onKeyStroke/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/onKeyStroke/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/onKeyStroke/index.browser.test.ts) (mirrored by `useKeyStroke.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/onKeyStroke/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useKeyStroke.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useKeyStroke.ts), docs + demo co-located in `packages/core/useKeyStroke/`

<Contributors name="useKeyStroke" />
