---
category: Sensors
---

# usePointerSwipe

Reactive swipe detection based on [PointerEvents](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent) — React port of VueUse's [`usePointerSwipe`](https://vueuse.org/core/usePointerSwipe/).

**Mapping:** the Vue return object (`isSwiping` shallow ref, `direction` computed, reactive `posStart` / `posEnd`, `distanceX` / `distanceY` computeds) becomes a plain object of plain values backed by React state, derived during render. The `pointerdown` / `pointermove` / `pointerup` / `pointercancel` listeners attach in a self-contained `useEffect` (upstream composes `useEventListener`) and are removed on unmount, so nothing touches the DOM during render (SSR-safe). The `target` accepts an element, a ref-like `{ current }` object or a getter — it is re-resolved on every render and the listeners re-bind when the resolved element changes, so a `useRef` target that is `null` during first render still binds once React attaches the element. Below the threshold (default `50`) the direction stays `'none'`; `onSwipeEnd` only fires for swipes that actually crossed it.

## Usage

```tsx
import { usePointerSwipe } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement>(null)
const { isSwiping, direction } = usePointerSwipe(el, {
  threshold: 50,
  onSwipeEnd: (e, direction) => console.log(direction),
})
// direction: 'up' | 'down' | 'left' | 'right' | 'none'
```

<DemoContainer name="UsePointerSwipe" />

## Type Declarations

```ts
export type MaybeRefOrGetter<T> = T | { current: T } | (() => T)

export type UseSwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none'

export interface UsePointerSwipeOptions {
  /**
   * @default 50
   */
  threshold?: number
  /**
   * Callback on swipe start.
   */
  onSwipeStart?: (e: PointerEvent) => void
  /**
   * Callback on swipe move.
   */
  onSwipe?: (e: PointerEvent) => void
  /**
   * Callback on swipe end.
   */
  onSwipeEnd?: (e: PointerEvent, direction: UseSwipeDirection) => void
  /**
   * Pointer types to listen to.
   *
   * @default ['mouse', 'touch', 'pen']
   */
  pointerTypes?: ('mouse' | 'touch' | 'pen')[]
  /**
   * Disable text selection on swipe.
   *
   * @default false
   */
  disableTextSelect?: boolean
}

export interface UsePointerSwipeReturn {
  readonly isSwiping: boolean
  direction: UseSwipeDirection
  readonly posStart: Readonly<{ x: number, y: number }>
  readonly posEnd: Readonly<{ x: number, y: number }>
  distanceX: number
  distanceY: number
  stop: () => void
}

export function usePointerSwipe(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options?: UsePointerSwipeOptions,
): UsePointerSwipeReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePointerSwipe/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePointerSwipe/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePointerSwipe/index.browser.test.ts) (mirrored in `packages/core/src/usePointerSwipe.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePointerSwipe/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePointerSwipe.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePointerSwipe.ts), docs + demo co-located in `packages/core/usePointerSwipe/`

<Contributors name="usePointerSwipe" />
