---
category: Animation
---

# useTimeout

A reactive value that becomes `true` after a given time — React port of VueUse's [`useTimeout`](https://vueuse.org/shared/useTimeout/).

**Mapping:** upstream `useTimeout` wraps `useTimeoutFn` and derives `ready` as `!isPending`;
since `useTimeoutFn` is mapped in its own module, this port inlines the timer logic to stay
self-contained — `ref` → `useState`, the setup-time `start()` becomes a mount `useEffect`,
and `tryOnScopeDispose(stop)` becomes the effect cleanup. `interval` accepts a number or a
getter (upstream: `MaybeRefOrGetter<number>`); `start` / `stop` are stable callbacks.

## Usage

```tsx
import { useTimeout } from '@reaxuse/shared'

const ready = useTimeout(1000) // boolean, becomes true after 1s

const { ready, start, stop } = useTimeout(1000, { controls: true })
```

<DemoContainer name="UseTimeout" />

## Type Declarations

```ts
export interface UseTimeoutOptions<Controls extends boolean = false> {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls
  /**
   * Callback on timeout
   */
  callback?: () => void
  /**
   * Start the timer immediately
   *
   * @default true
   */
  immediate?: boolean
  /**
   * Execute the callback immediately after calling `start`
   *
   * @default false
   */
  immediateCallback?: boolean
}

export interface UseTimeoutReturn {
  ready: boolean
  isPending: boolean
  start: () => void
  stop: () => void
}

export function useTimeout(
  interval?: number | (() => number),
  options?: UseTimeoutOptions<false>,
): boolean
export function useTimeout(
  interval: number | (() => number),
  options: UseTimeoutOptions<true>,
): UseTimeoutReturn
```

## Source

- VueUse: [`packages/shared/useTimeout`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useTimeout) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useTimeout/index.ts), tests [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useTimeout/index.test.ts)
- reaxuse: [`packages/shared/src/useTimeout.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useTimeout.ts)

<Contributors name="useTimeout" />
