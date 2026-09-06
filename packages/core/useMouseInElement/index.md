---
category: Elements
---

# useMouseInElement

Reactive mouse position related to an element — React port of VueUse's [`useMouseInElement`](https://vueuse.org/core/useMouseInElement/).

**Mapping:** the Vue refs returned by upstream (`x`, `y`, `elementX`, `elementY`, `elementPositionX`, `elementPositionY`, `elementHeight`, `elementWidth`, `isOutside`, plus `sourceType` and `stop`) become a plain object of plain values backed by one `useState`. The `target` is an element, a React ref object (`RefObject<HTMLElement | null>`) or a getter — listeners attach in a mount `useEffect` and are cleaned up on unmount, and `stop()` detaches every listener/observer permanently. The window `mousemove`/`dragover` listeners feed `x`/`y` (upstream's `useMouse` is inlined), and the element metrics recompute on `scroll`/`resize`, on `style`/`class` mutations and on element size changes. SSR-safe — nothing touches `window` or the DOM during render.

## Usage

```tsx
import { useMouseInElement } from '@reaxuse/core'
import { useRef } from 'react'

const target = useRef<HTMLDivElement>(null)

const { x, y, elementX, elementY, isOutside } = useMouseInElement(target)
```

```tsx
<div ref={target}>
  <h1>Hello world</h1>
</div>
```

<DemoContainer name="UseMouseInElement" />

## Type Declarations

```ts
export type UseMouseCoordType = 'page' | 'client' | 'screen' | 'movement'
export type UseMouseSourceType = 'mouse' | 'touch' | null

export interface MouseInElementOptions {
  /**
   * Whether to handle mouse events when the cursor is outside the target element.
   * When enabled, mouse position will continue to be tracked even when outside the element bounds.
   *
   * @default true
   */
  handleOutside?: boolean
  /**
   * Listen to window resize event
   *
   * @default true
   */
  windowScroll?: boolean
  /**
   * Listen to window scroll event
   *
   * @default true
   */
  windowResize?: boolean
  /**
   * Mouse position based by page, client, screen, or relative to previous position
   *
   * @default 'page'
   */
  type?: UseMouseCoordType
  /**
   * Listen to `touchmove` events
   *
   * @default true
   */
  touch?: boolean
  /**
   * Listen to `scroll` events on window, only effective on type `page`
   *
   * @default true
   */
  scroll?: boolean
  /**
   * Reset to initial value when `touchend` event fired
   *
   * @default false
   */
  resetOnTouchEnds?: boolean
  /**
   * Initial values
   */
  initialValue?: { x: number, y: number }
  /**
   * Allow a custom `window` instance, e.g. working with iframes or in testing
   * environments.
   */
  window?: Window
}

export interface UseMouseInElementReturn {
  x: number
  y: number
  sourceType: UseMouseSourceType
  elementX: number
  elementY: number
  elementPositionX: number
  elementPositionY: number
  elementHeight: number
  elementWidth: number
  isOutside: boolean
  stop: () => void
}

export function useMouseInElement(
  target?: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options?: MouseInElementOptions,
): UseMouseInElementReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useMouseInElement/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMouseInElement/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMouseInElement/index.browser.test.ts) (mirrored in `packages/core/src/useMouseInElement.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMouseInElement/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useMouseInElement.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useMouseInElement.ts), docs + demo co-located in `packages/core/useMouseInElement/`

<Contributors name="useMouseInElement" />
