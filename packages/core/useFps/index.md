---
category: Sensors
---

# useFps

Reactive FPS (frames per second) — React port of VueUse's
[`useFps`](https://vueuse.org/core/useFps/). Returns a plain number
(`0` initially) updated by a `requestAnimationFrame` loop driven by
`useRafFn`; the rate is recomputed every `every` frames (default 10).

**Mapping:** upstream's `shallowRef(0)` + `useRafFn` subscription →
`useState(0)` + the `useRafFn` mount effect (cancelled on unmount). The
`last` / `ticks` bookkeeping lives in refs, and `performance` is only ever
touched inside the frame callback, so SSR renders safely see `0`.

## Usage

```tsx
import { useFps } from '@reaxuse/core'

const fps = useFps()
// 60

const fpsEvery2 = useFps({ every: 2 }) // measure over every 2 frames
```

<DemoContainer name="UseFps" />

## Type Declarations

```ts
export interface UseFpsOptions {
  /**
   * Calculate the FPS on every x frames.
   * @default 10
   */
  every?: number
}

export function useFps(options?: UseFpsOptions): number
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useFps/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFps/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFps/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useFps.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useFps.ts), docs + demo co-located in `packages/core/useFps/`

<Contributors name="useFps" />
