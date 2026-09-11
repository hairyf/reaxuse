---
category: Sensors
---

# useDevicePixelRatio

Reactively track [`window.devicePixelRatio`](https://developer.mozilla.org/docs/Web/API/Window/devicePixelRatio)

> NOTE: there is no event listener for `window.devicePixelRatio` change. So this function uses [`Testing media queries programmatically (window.matchMedia)`](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Testing_media_queries) applying the same mechanism as described in [this example](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#monitoring_screen_resolution_or_zoom_level_changes).

## Usage

```tsx
import { useDevicePixelRatio } from '@reause/core'

const { pixelRatio } = useDevicePixelRatio()

console.log(pixelRatio)
```

## Type Declarations

```ts
export interface UseDevicePixelRatioOptions extends ConfigurableWindow {}
export interface UseDevicePixelRatioReturn {
  pixelRatio: number
  /**
   * Stop tracking: removes the current `matchMedia` change listener and
   * prevents any future re-subscription (upstream's `WatchStopHandle`).
   */
  stop: () => void
}
/**
 * React port of VueUse's `useDevicePixelRatio`. Reactively track
 * `window.devicePixelRatio`.
 *
 * Map from @vueuse/core `useDevicePixelRatio`
 * (`source/vueuse/packages/core/useDevicePixelRatio/`), which keeps a
 * `shallowRef(1)` updated by a `watchImmediate` over a
 * `useMediaQuery('(resolution: N dppx)')` — when the resolution media query
 * stops matching, the real `window.devicePixelRatio` is read into the ref,
 * which re-writes the query string so it always targets the current
 * resolution.
 *
 * React divergences:
 * - the Vue `shallowRef`/`watchImmediate` pair becomes a plain number state
 *   updated inside a self-contained `useEffect` that (re)subscribes a
 *   `matchMedia('(resolution: N dppx)')` `change` listener; the effect
 *   re-runs whenever `pixelRatio` changes so the query always matches the
 *   current resolution (mirroring upstream's reactive query string);
 * - SSR renders the `1` initial value (matching upstream's `shallowRef(1)`)
 *   without touching `window`; the real value is read on mount;
 * - upstream's `stop` handle becomes a plain `stop` callback that removes
 *   the current `matchMedia` listener and stops future re-subscriptions
 *   (effect cleanup still runs on unmount);
 * - when a window exists but `matchMedia` is unavailable, the real
 *   `window.devicePixelRatio` is still read once (upstream's `watchImmediate`
 *   reads it before the media query is involved) and then freezes.
 *
 * @example
 * const { pixelRatio } = useDevicePixelRatio()
 */
export declare function useDevicePixelRatio(
  options?: UseDevicePixelRatioOptions,
): UseDevicePixelRatioReturn
```
