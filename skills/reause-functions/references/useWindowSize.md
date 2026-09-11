---
category: Elements
---

# useWindowSize

Reactive window size

## Usage

```tsx
import { useWindowSize } from '@reause/core'

const { width, height } = useWindowSize() // plain numbers, re-render on resize
// SSR renders the Infinity defaults; after mount it tracks the real window size
```

## Type Declarations

```ts
export interface UseWindowSizeOptions extends ConfigurableWindow {
  initialWidth?: number
  initialHeight?: number
  /**
   * Listen to the `orientation: portrait` media-query change (upstream's
   * stand-in for the `orientationchange` event).
   *
   * @default true
   */
  listenOrientation?: boolean
  /**
   * Whether the scrollbar should be included in the width and height.
   * Only effective when `type` is `'inner'`.
   *
   * @default true
   */
  includeScrollbar?: boolean
  /**
   * Use `window.innerWidth` or `window.outerWidth` or `window.visualViewport`.
   *
   * @default 'inner'
   */
  type?: "inner" | "outer" | "visual"
}
export interface UseWindowSizeReturn {
  width: number
  height: number
}
/**
 * React port of VueUse's `useWindowSize`. Reactive window size.
 *
 * Map from @vueuse/core `useWindowSize`
 * (`source/vueuse/packages/core/useWindowSize/`), which keeps `width` and
 * `height` shallow refs and refreshes them on window `resize` (plus the
 * `orientation: portrait` media query when `listenOrientation`, and the
 * `visualViewport` when `type: 'visual'`).
 *
 * React divergences:
 * - the Vue `ShallowRef` return becomes a plain `{ width, height }` state
 *   object, so the component re-renders on every size change;
 * - the initial `update()` and the listeners move into a self-contained
 *   `useEffect` (upstream uses `useEventListener` and calls `update()` during
 *   setup), so SSR renders the `initialWidth`/`initialHeight` defaults
 *   (`Number.POSITIVE_INFINITY`, matching upstream) without touching
 *   `window`;
 * - upstream's `useMediaQuery('(orientation: portrait)')` watch becomes a
 *   `matchMedia` `change` listener, guarded for environments without
 *   `matchMedia`;
 * - the `resize` listener attaches to the resolved window target — the
 *   `options.window` instance when given, otherwise the global window —
 *   while upstream always listens on the global window and only *reads* the
 *   custom window; listening where we read means a custom target (e.g. an
 *   iframe) receives its own resize events;
 * - like upstream, the options are captured once on the first render: a
 *   mid-life change to `window` / `type` / `includeScrollbar` /
 *   `listenOrientation` does not re-subscribe the listeners.
 *
 * @example
 * const { width, height } = useWindowSize()
 */
export declare function useWindowSize(
  options?: UseWindowSizeOptions,
): UseWindowSizeReturn
```
