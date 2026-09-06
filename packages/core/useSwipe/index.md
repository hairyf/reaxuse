---
category: Sensors
---

# useSwipe

Reactive swipe detection based on [`TouchEvents`](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent) — React port of VueUse's [`useSwipe`](https://vueuse.org/core/useSwipe/).

**Mapping:** the Vue return object (`isSwiping` ref, `direction` / `lengthX` / `lengthY` computeds, reactive coords) becomes plain values backed by React state, derived during render. The `touchstart` / `touchmove` / `touchend` / `touchcancel` listeners attach in a mount `useEffect` (upstream composes `useEventListener`) and are removed on unmount, so nothing touches the DOM during render (SSR-safe). The `target` accepts an element, a ref-like `{ current }` object or a getter — it is re-resolved on every render and the listeners re-bind when the resolved element changes, so a `useRef` target that is `null` during first render still binds once React attaches the element. Below the threshold (default `50`) the direction stays `'none'`; `onSwipeEnd` only fires for touches that actually crossed it.

## Usage

```tsx
import { useSwipe } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement>(null)
const { isSwiping, direction, lengthX, lengthY } = useSwipe(el, {
  threshold: 50,
  onSwipeEnd: (e, direction) => console.log(direction),
})
// direction: 'up' | 'down' | 'left' | 'right' | 'none'
```

<DemoContainer name="UseSwipe" />

## Type Declarations

```ts
export type MaybeRefOrGetter<T> = T | { current: T } | (() => T)

export type UseSwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none'

export interface UseSwipeOptions {
  /**
   * Register events as passive
   *
   * @default true
   */
  passive?: boolean
  /**
   * @default 50
   */
  threshold?: number
  /**
   * Callback on swipe start
   */
  onSwipeStart?: (e: TouchEvent) => void
  /**
   * Callback on swipe moves
   */
  onSwipe?: (e: TouchEvent) => void
  /**
   * Callback on swipe ends
   */
  onSwipeEnd?: (e: TouchEvent, direction: UseSwipeDirection) => void
}

export interface UseSwipeReturn {
  isSwiping: boolean
  direction: UseSwipeDirection
  coordsStart: Readonly<{ x: number, y: number }>
  coordsEnd: Readonly<{ x: number, y: number }>
  lengthX: number
  lengthY: number
  stop: () => void
}

export function useSwipe(
  target: MaybeRefOrGetter<EventTarget | null | undefined>,
  options?: UseSwipeOptions,
): UseSwipeReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useSwipe/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSwipe/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSwipe/index.test.ts) (mirrored in `packages/core/src/useSwipe.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSwipe/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useSwipe.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useSwipe.ts), docs + demo co-located in `packages/core/useSwipe/`

<Contributors name="useSwipe" />
