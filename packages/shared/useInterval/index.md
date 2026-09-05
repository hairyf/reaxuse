---
category: Animation
---

# useInterval

Reactive counter that increases on every interval — React port of VueUse's [`useInterval`](https://vueuse.org/shared/useInterval/).

**Mapping:** upstream `useInterval` wraps `useIntervalFn` and returns a readonly `ShallowRef<number>`;
since `useIntervalFn` is mapped in its own module, this port inlines the interval logic to stay
self-contained — the counter is a plain `number` state (no `.value`), the setup-time `resume()`
becomes a mount `useEffect`, and `tryOnScopeDispose(pause)` becomes the effect cleanup.
`{ controls: true }` exposes `{ counter, reset, isActive, pause, resume }` (upstream:
`UseIntervalControls & Pausable`). `interval` accepts a number or a getter (upstream:
`MaybeRefOrGetter<number>`) evaluated on start / `resume`; unlike upstream's reactive watch on
the interval, a changed value takes effect on the next `resume()`. `immediateCallback` follows
`useIntervalFn`'s semantics (upstream `useInterval` doesn't forward it).

## Usage

```tsx
import { useInterval } from '@reaxuse/shared'

// count will increase every 200ms
const counter = useInterval(200)
// note: counter is a plain number, not a ref (no `.value`)

const { counter, reset, isActive, pause, resume } = useInterval(200, { controls: true })
```

<DemoContainer name="UseInterval" />

## Type Declarations

```ts
export interface UseIntervalOptions<Controls extends boolean = false> {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls
  /**
   * Start the interval automatically on mount
   *
   * @default true
   */
  immediate?: boolean
  /**
   * Callback on every interval tick, receives the incremented count
   */
  callback?: (count: number) => void
  /**
   * Increment the counter (and fire `callback`) immediately when the interval
   * starts or `resume` is called
   *
   * @default false
   */
  immediateCallback?: boolean
}

export interface UseIntervalControls {
  /**
   * Current count
   */
  counter: number
  /**
   * Reset the counter to `0`
   */
  reset: () => void
  /**
   * `true` while the interval is running
   */
  isActive: boolean
  /**
   * Stop the interval
   */
  pause: () => void
  /**
   * (Re)start the interval
   */
  resume: () => void
}

export function useInterval(
  interval?: number | (() => number),
  options?: UseIntervalOptions<false>,
): number
export function useInterval(
  interval: number | (() => number),
  options: UseIntervalOptions<true>,
): UseIntervalControls
```

## Source

- VueUse: [`packages/shared/useInterval`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useInterval) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useInterval/index.ts), demo [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useInterval/demo.vue)
- reaxuse: [`packages/shared/src/useInterval.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useInterval.ts)

<Contributors name="useInterval" />
