---
category: Elements
---

# useElementSize

Reactive size of an HTML element. [ResizeObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)

## Usage

```tsx
import { useElementSize } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLTextAreaElement | null>(null)
const { width, height, stop } = useElementSize(el)
```

The element's size updates as it is resized:

```tsx
import { useElementSize } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement | null>(null)
const { width, height } = useElementSize(el, { width: 0, height: 0 }, { box: 'border-box' })

// <div ref={el} style={{ resize: 'both', overflow: 'auto' }}>
//   Width: {width}, Height: {height}
// </div>
```

The observer is disconnected automatically on unmount. Call `stop()` to disconnect earlier.

## Type Declarations

```ts
export interface ElementSize {
  width: number
  height: number
}
export interface UseElementSizeOptions extends UseResizeObserverOptions {}
export interface UseElementSizeReturn {
  width: number
  height: number
  stop: () => void
}
/**
 * Reactive size of an HTML element.
 *
 * Map from @vueuse/core `useElementSize`
 * (`source/vueuse/packages/core/useElementSize/`), which observes the target
 * element with a platform `ResizeObserver` and reports the size of the box
 * selected by the `box` option (`border-box`, `content-box` or
 * `device-pixel-content-box`), falling back to `getBoundingClientRect` for SVG
 * elements and to `contentRect` when the box sizes are unavailable.
 *
 * React divergences:
 * - `width`/`height` are plain `number` state (upstream: `ShallowRef`s), so
 *   the return value is `{ width, height, stop }` — an object mirror, not a
 *   tuple;
 * - the upstream `tryOnMounted` prefill (from `offsetWidth`/`offsetHeight`,
 *   with padding/border subtracted for `content-box`) becomes a mount-only
 *   effect, so the size is correct before the first async observer delivery;
 * - the upstream `watch(() => unrefElement(target), ...)` (reset the size to
 *   `initialSize`, or `0` when detached, whenever the resolved target element
 *   changes) becomes an effect that re-resolves the target after every render
 *   and resets only when the resolved element actually changed;
 * - `stop()` is referentially stable, disconnects the observer and disables
 *   the target-change reset;
 * - the `window` option mirrors upstream's `{ window = defaultWindow }`
 *   destructure: an explicit `window: null` stays null and disables the
 *   SVG-rect branch and the content-box computed-style prefill (both gated on
 *   a truthy window), falling back to `contentRect` / plain `offsetWidth`.
 *
 * SSR-safe: nothing touches `window` during render — the observer, the prefill
 * and the reset all happen in effects.
 *
 * @example
 * const el = useRef<HTMLTextAreaElement | null>(null)
 * const { width, height, stop } = useElementSize(el)
 */
export declare function useElementSize(
  target: ElementTarget,
  initialSize?: ElementSize,
  options?: UseElementSizeOptions,
): UseElementSizeReturn
```
