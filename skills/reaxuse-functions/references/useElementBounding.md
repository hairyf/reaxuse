---
category: Elements
---

# useElementBounding

Reactive [bounding box](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) of an HTML element

## Usage

```tsx
import { useElementBounding } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement | null>(null)
const { x, y, top, right, bottom, left, width, height } = useElementBounding(el)
```

The bounding box updates as the element is resized, scrolled or restyled:

```tsx
import { useElementBounding } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLTextAreaElement | null>(null)
const { width, height, update } = useElementBounding(el)

// <div>
//   <textarea ref={el} style={{ resize: 'both', overflow: 'hidden' }} />
//   Width: {width}, Height: {height}
//   <button onClick={update}>Re-measure</button>
// </div>
```

Call `update()` to re-measure on demand, e.g. after a synchronous layout change.

## Type Declarations

```ts
/**
 * Options for `useElementBounding`: `reset` (re-zero on detached element),
 * `windowResize` / `windowScroll` (window listeners), `immediate` (measure on
 * mount) and `updateTiming` (`'sync'` or `'next-frame'`), plus a custom
 * `window` instance, e.g. working with iframes or in testing environments.
 */
export interface UseElementBoundingOptions extends ConfigurableWindow {
  /**
   * Reset values to 0 when the element is unmounted / detached.
   *
   * @default true
   */
  reset?: boolean
  /**
   * Listen to window resize event
   *
   * @default true
   */
  windowResize?: boolean
  /**
   * Listen to window scroll event
   *
   * @default true
   */
  windowScroll?: boolean
  /**
   * Immediately call update on component mounted
   *
   * @default true
   */
  immediate?: boolean
  /**
   * Timing to recalculate the bounding box
   *
   * Setting to `next-frame` can be useful when using this together with
   * something like `useBreakpoints` and therefore the layout (which influences
   * the bounding box of the observed element) is not updated on the current
   * tick.
   *
   * @default 'sync'
   */
  updateTiming?: "sync" | "next-frame"
}
/**
 * Return of `useElementBounding`. Upstream exposes `ShallowRef`s; the React
 * port exposes plain `number` state plus the `update` function.
 */
export interface UseElementBoundingReturn {
  height: number
  bottom: number
  left: number
  right: number
  top: number
  width: number
  x: number
  y: number
  update: () => void
}
/**
 * Reactive bounding box of an HTML element.
 *
 * Map from @vueuse/core `useElementBounding`
 * (`source/vueuse/packages/core/useElementBounding/`), which measures the
 * target with `getBoundingClientRect()` and re-measures on window
 * `scroll`/`resize`, on `style`/`class` mutations (MutationObserver) and on
 * element size changes (ResizeObserver).
 *
 * React divergences:
 * - the Vue `ShallowRef`s returned by upstream become a plain object of plain
 *   `number` state read off the result — `x`, `y`, `top`, `right`, `bottom`,
 *   `left`, `width`, `height` — plus `update()`, which re-measures on demand;
 * - `target` accepts a plain element or a React ref object (`{ current }`) —
 *   the React analog of upstream's `ElementTarget`;
 * - upstream's `watch(() => unrefElement(target), ele => !ele && update())`
 *   (reset the values whenever the resolved target element becomes detached)
 *   becomes an effect that re-resolves the target after every render and
 *   re-measures only when the resolved element actually became `null`;
 * - upstream's `tryOnMounted` immediate measurement happens in a mount-only
 *   effect, so the values are correct before the first async observer
 *   delivery;
 * - the window `scroll`/`resize` listeners attach in a mount effect and are
 *   removed on unmount (upstream: `useEventListener`); the component and
 *   directive variants (`UseElementBounding` / `v-element-bounding`) are not
 *   ported — they have no React equivalents;
 * - SSR-safe: nothing touches `window` or the DOM during render — all
 *   measurements happen in effects.
 *
 * @param target - element or React ref object (`{ current }`) returning
 *   the element to measure the bounding box of
 * @param options - `reset` (default `true`), `windowResize` (default `true`),
 *   `windowScroll` (default `true`), `immediate` (default `true`),
 *   `updateTiming` (default `'sync'`), and a custom `window` instance
 * @example
 * const el = useRef<HTMLDivElement | null>(null)
 * const { x, y, top, right, bottom, left, width, height } = useElementBounding(el)
 */
export declare function useElementBounding(
  target: ElementTarget,
  options?: UseElementBoundingOptions,
): UseElementBoundingReturn
```
