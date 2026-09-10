---
category: Sensors
---

# useFps

Reactive FPS (frames per second)

## Usage

```tsx
import { useFps } from '@reaxuse/core'

const fps = useFps()
// 60

const fpsEvery2 = useFps({ every: 2 }) // measure over every 2 frames
```

## Type Declarations

```ts
export interface UseFpsOptions {
  /**
   * Calculate the FPS on every x frames.
   *
   * @default 10
   */
  every?: number
}
/**
 * Reactive FPS (frames per second).
 *
 * Map from @vueuse/core `useFps`
 * (`source/vueuse/packages/core/useFps/`): counts `requestAnimationFrame`
 * ticks and reports the rounded frame rate once `every` frames (default 10)
 * have elapsed, driven by the shared `useRafFn` frame loop.
 *
 * React divergences:
 * - the upstream `ShallowRef<number>` becomes a plain number state
 *   (`useState(0)`), and the upstream `typeof performance === 'undefined'`
 *   early return becomes a per-frame guard, so SSR renders only ever see the
 *   `0` default and never touch `performance` or `requestAnimationFrame`;
 * - the setup-time `useRafFn` subscription becomes `useRafFn`'s mount effect,
 *   cancelled on unmount;
 * - `last` / `ticks` bookkeeping live in refs instead of the setup closure,
 *   so the running frame loop always reads the latest values; `last` is
 *   seeded at setup time (upstream parity), so the first rate is reported
 *   after `every` frames.
 *
 * @example
 * const fps = useFps()
 */
export declare function useFps(options?: UseFpsOptions): number
```
