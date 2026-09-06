---
category: Sensors
---

# useKeyModifier

Reactive [Modifier State](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState). Tracks state of any of the [supported modifiers](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState#browser_compatibility) — React port of VueUse's [`useKeyModifier`](https://vueuse.org/core/useKeyModifier/).

**Mapping:** the Vue `ShallowRef<boolean | null>` return becomes a plain `boolean | null` state value; the configured events (default `mousedown` / `mouseup` / `keydown` / `keyup`) are bound to the document in a self-contained `useEffect` (upstream composes `useEventListener`) and removed on unmount; the `initial` option feeds `useState`, so SSR renders the `null` default without touching the DOM.

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

<DemoContainer name="UseKeyModifier" />

## Type Declarations

```ts
export type KeyModifier = 'Alt' | 'AltGraph' | 'CapsLock' | 'Control' | 'Fn' | 'FnLock' | 'Meta' | 'NumLock' | 'ScrollLock' | 'Shift' | 'Symbol' | 'SymbolLock'

export interface UseModifierOptions<Initial> {
  /**
   * Event names that will prompt update to modifier states
   *
   * @default ['mousedown', 'mouseup', 'keydown', 'keyup']
   */
  events?: string[]
  /**
   * Initial value of the returned state
   *
   * @default null
   */
  initial?: Initial
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in testing environments.
   */
  document?: Document
}

export type UseKeyModifierReturn<Initial> = Initial extends boolean ? boolean : boolean | null

export function useKeyModifier<Initial extends boolean | null>(
  modifier: KeyModifier,
  options?: UseModifierOptions<Initial>,
): UseKeyModifierReturn<Initial>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useKeyModifier/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useKeyModifier/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useKeyModifier/index.test.ts) (tests mirrored in `packages/core/src/useKeyModifier.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useKeyModifier/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useKeyModifier.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useKeyModifier.ts), docs + demo co-located in `packages/core/useKeyModifier/`

<Contributors name="useKeyModifier" />
