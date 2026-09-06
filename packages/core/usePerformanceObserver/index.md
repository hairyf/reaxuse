---
category: Browser
---

# usePerformanceObserver

Observe performance metrics — React port of VueUse's [`usePerformanceObserver`](https://vueuse.org/core/usePerformanceObserver/).

**Mapping:** `useSupported` + a synchronous start during Vue setup → `useState(false)` + a mount
`useEffect` that creates the `PerformanceObserver` and disconnects it on unmount (upstream wires
the equivalent through `tryOnScopeDispose(stop)`). `isSupported` becomes a plain boolean; the
callback and observe options are read through refs so `start`/`stop` stay stable across renders,
and the observer re-subscribes when the `window` option changes. When the resolved `window` has no
`PerformanceObserver` (SSR, testing stubs), the hook reports `isSupported: false` and `start()` is
a silent no-op. The demo passes `buffered: true` so paint entries emitted before the mount effect
are still delivered — a divergence from the upstream demo, which starts during Vue setup before
the first paint.

## Usage

```tsx
import { usePerformanceObserver } from '@reaxuse/core'

const { isSupported, start, stop } = usePerformanceObserver(
  { entryTypes: ['paint'] },
  list => setEntrys(list.getEntries()),
)
// starts automatically (immediate: true by default) — stop() disconnects
```

<DemoContainer name="UsePerformanceObserver" />

## Type Declarations

```ts
export type UsePerformanceObserverOptions = PerformanceObserverInit & {
  window?: Window
  immediate?: boolean
}

export function usePerformanceObserver(options: UsePerformanceObserverOptions, callback: PerformanceObserverCallback): {
  isSupported: boolean
  start: () => void
  stop: () => void
}
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePerformanceObserver/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePerformanceObserver/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePerformanceObserver/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePerformanceObserver.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePerformanceObserver.ts), docs + demo co-located in `packages/core/usePerformanceObserver/`

<Contributors name="usePerformanceObserver" />
