---
category: Animation
---

# useTimestamp

Reactive current timestamp (`Date.now() + offset`), updating on every animation frame

## Usage

```tsx
import { useTimestamp } from '@reause/core'

const timestamp = useTimestamp({ offset: 0 })
```

```tsx
import { useTimestamp } from '@reause/core'
// ---cut---
const { timestamp, pause, resume } = useTimestamp({ controls: true })
```

## Type Declarations

```ts
export interface UseTimestampOptions<Controls extends boolean> {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls
  /**
   * Offset value adding to the value
   *
   * @default 0
   */
  offset?: number
  /**
   * Callback on each update
   */
  callback?: (timestamp: number) => void
}
export interface UseTimestampControls {
  timestamp: number
  isActive: boolean
  pause: () => void
  resume: () => void
}
export type UseTimestampReturn<Controls extends boolean> = Controls extends true
  ? UseTimestampControls
  : number
/**
 * React port of VueUse's `useTimestamp`.
 *
 * Map from @vueuse/core `useTimestamp`
 * (`source/vueuse/packages/core/useTimestamp/`). Reactive current timestamp
 * (`Date.now() + offset`), updated on every animation frame — upstream's
 * default scheduler is `useRafFn`.
 *
 * React divergences:
 * - the upstream `ShallowRef<number>` return becomes a plain `number`
 *   state;
 * - with `controls: true` the return is
 *   `{ timestamp, isActive, pause, resume }`, where `isActive` is a plain
 *   boolean state (upstream's `Pausable` exposes it as a ref) and
 *   `pause`/`resume` toggle the underlying loop;
 * - the rAF loop is inlined in a `useEffect` and cancelled with
 *   `cancelAnimationFrame` on unmount — SSR-safe, since effects never run
 *   on the server;
 * - `offset` is read once, on the first render (upstream captures it at
 *   setup, `index.ts:50-52`) — a later change to the option does not
 *   cancel/restart the rAF loop;
 * - upstream's `scheduler` option (`ConfigurableScheduler`, backed by Vue
 *   composables like `useRafFn`/`useIntervalFn`) has no React equivalent
 *   and is not ported — the rAF loop is the fixed driver.
 *
 * @example
 * const timestamp = useTimestamp({ offset: 0 })
 */
export declare function useTimestamp(
  options?: UseTimestampOptions<false>,
): number
export declare function useTimestamp(
  options: UseTimestampOptions<true>,
): UseTimestampControls
```
