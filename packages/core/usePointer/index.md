---
category: Sensors
---

# usePointer

Reactive pointer state — React port of VueUse's [`usePointer`](https://vueuse.org/core/usePointer/).

**Mapping:** the Vue refs returned by upstream (`x`, `y`, `pressure`, `pointerType`, ..., plus
`isInside`) become a plain object of plain values held in one `useState` (with `initialValue`
folded into the initializer). The upstream `pointerdown`/`pointermove`/`pointerup` listeners
attach in a mount `useEffect` on the `target` option (default `window`), re-subscribing when
`target`/`pointerTypes` change and removing all listeners on unmount;
`pointerleave`/`pointercancel` flip `isInside` back to `false`. SSR-safe — no `window` access
during render, so the server renders the defaults.

## Usage

```tsx
import { usePointer } from '@reaxuse/core'

const { x, y, pressure, pointerType, isInside } = usePointer()

// only let `pen` pointers update the state
const pen = usePointer({ pointerTypes: ['pen'] })
```

<DemoContainer name="UsePointer" />

## Type Declarations

```ts
export type PointerType = 'mouse' | 'touch' | 'pen'

export interface UsePointerState {
  x: number
  y: number
  pointerId: number
  pressure: number
  tiltX: number
  tiltY: number
  width: number
  height: number
  twist: number
  pointerType: PointerType | null
}

export interface UsePointerOptions {
  /**
   * Pointer types that listen to.
   *
   * @default ['mouse', 'touch', 'pen']
   */
  pointerTypes?: PointerType[]

  /**
   * Initial values.
   */
  initialValue?: Partial<UsePointerState>

  /**
   * @default window
   */
  target?: EventTarget | null | undefined
}

export interface UsePointerReturn extends UsePointerState {
  isInside: boolean
}

export function usePointer(options?: UsePointerOptions): UsePointerReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePointer/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePointer/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePointer/index.test.ts) (mirrored in `usePointer.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePointer/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePointer.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePointer.ts), docs + demo co-located in `packages/core/usePointer/`

<Contributors name="usePointer" />
