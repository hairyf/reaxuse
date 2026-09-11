---
category: Browser
---

# usePerformanceObserver

Observe performance metrics

## Usage

```tsx
import { usePerformanceObserver } from '@reause/core'
import { useState } from 'react'

const [entrys, setEntrys] = useState<PerformanceEntry[]>([])
const { isSupported, start, stop } = usePerformanceObserver(
  { entryTypes: ['paint'] },
  list => setEntrys(list.getEntries()),
)
// starts automatically (immediate: true by default) — stop() disconnects
```

## Type Declarations

```ts
export type UsePerformanceObserverOptions = PerformanceObserverInit & {
  /**
   * Specify a custom `window` instance, e.g. working with iframes or in
   * testing environments.
   */
  window?: Window
  /**
   * Start the observer immediate.
   *
   * @default true
   */
  immediate?: boolean
}
/**
 * React port of VueUse's `usePerformanceObserver`.
 *
 * Map from @vueuse/core `usePerformanceObserver`
 * (`source/vueuse/packages/core/usePerformanceObserver/`), which creates a
 * `PerformanceObserver` and returns `{ isSupported, start, stop }`.
 *
 * React divergences:
 * - the `isSupported` computed ref becomes plain boolean state evaluated in
 *   the mount effect, so nothing touches `window` during render (SSR-safe —
 *   the server renders `false` without accessing `PerformanceObserver`);
 * - the observer is created inside a mount `useEffect` (upstream starts
 *   synchronously during setup when `immediate` is `true`) and is
 *   disconnected on unmount — upstream wires the equivalent through
 *   `tryOnScopeDispose(stop)`; changing the `window` option re-subscribes;
 * - the callback and observe options are read through refs, so the returned
 *   `start`/`stop` are stable across renders (`stop` reads the observer from
 *   a sync ref);
 * - when the resolved `window` has no `PerformanceObserver`, the hook reports
 *   `isSupported: false` and `start()` is a silent no-op (same as upstream).
 *
 * @example
 * const [entrys, setEntrys] = useState<PerformanceEntry[]>([])
 * const { isSupported, start, stop } = usePerformanceObserver(
 *   { entryTypes: ['paint'] },
 *   list => setEntrys(list.getEntries()),
 * )
 */
export declare function usePerformanceObserver(
  options: UsePerformanceObserverOptions,
  callback: PerformanceObserverCallback,
): {
  isSupported: boolean
  start: () => void
  stop: () => void
}
```
