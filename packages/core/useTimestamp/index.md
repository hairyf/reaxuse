---
category: Animation
---

# useTimestamp

Reactive current timestamp (`Date.now() + offset`), updating on every
animation frame — React port of VueUse's
[`useTimestamp`](https://vueuse.org/core/useTimestamp/).

**Mapping:** `shallowRef(timestamp() + offset)` + the default `useRafFn`
scheduler → `useState` + a rAF loop inlined in a `useEffect`, cancelled with
`cancelAnimationFrame` on unmount (SSR-safe). The Vue ref return becomes a
plain `number`; `controls: true` returns
`{ timestamp, isActive, pause, resume }` with `isActive` as a plain boolean.
Upstream's `scheduler` option (`ConfigurableScheduler`) is not portable to
React and is not ported.

## Usage

```tsx
import { useTimestamp } from '@reaxuse/core'

const timestamp = useTimestamp({ offset: 0 }) // updates every animation frame
```

<DemoContainer name="UseTimestamp" />

## Type Declarations

```ts
export interface UseTimestampOptions<Controls extends boolean> {
  controls?: Controls
  offset?: number
  callback?: (timestamp: number) => void
}

export interface UseTimestampControls {
  timestamp: number
  isActive: boolean
  pause: () => void
  resume: () => void
}

export function useTimestamp(options?: UseTimestampOptions<false>): number
export function useTimestamp(options: UseTimestampOptions<true>): UseTimestampControls
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useTimestamp/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTimestamp/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTimestamp/index.browser.test.ts) (mirrored in `packages/core/src/useTimestamp.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTimestamp/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useTimestamp.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTimestamp.ts), docs + demo co-located in `packages/core/useTimestamp/`

<Contributors name="useTimestamp" />
