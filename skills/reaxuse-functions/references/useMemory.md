---
category: Browser
---

# useMemory

Reactive Memory Info

## Usage

```tsx
import { useMemory } from '@reaxuse/core'

const { isSupported, memory } = useMemory()
```

## Type Declarations

```ts
/**
 * Performance.memory
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory
 */
export interface MemoryInfo {
  /**
   * The maximum size of the heap, in bytes, that is available to the context.
   */
  readonly jsHeapSizeLimit: number
  /**
   * The total allocated heap size, in bytes.
   */
  readonly totalJSHeapSize: number
  /**
   * The currently active segment of JS heap, in bytes.
   */
  readonly usedJSHeapSize: number
  [Symbol.toStringTag]: "MemoryInfo"
}
/**
 * Pausable controls a scheduler reports back (upstream: `Pausable` from
 * `@vueuse/shared`) — see `useTimeoutPoll` for the canonical core type.
 */
export interface UseMemoryOptions {
  /**
   * Custom scheduler driving the periodic memory reads (upstream:
   * `ConfigurableScheduler`, whose default ticks every `1000` ms via
   * `useIntervalFn`).
   *
   * Called during render, so it must follow the Rules of Hooks — pass it
   * consistently across renders, e.g.
   * `scheduler: cb => useIntervalFn(cb, 500)` with `useIntervalFn` from
   * `@reaxuse/shared`.
   *
   * The returned `Pausable` is paused while `performance.memory` is
   * unavailable and resumed once it is detected, so `pause` / `resume` must
   * actually control the loop.
   *
   * @default useIntervalFn (1000 ms)
   */
  scheduler?: (cb: () => void) => Pausable
}
export interface UseMemoryReturn {
  /**
   * Whether the `performance.memory` API is available in the current
   * environment. `false` during render and on the server, resolved in a
   * mount effect.
   */
  isSupported: boolean
  /**
   * The current heap memory info, `undefined` when unsupported (and before
   * the first read).
   */
  memory: MemoryInfo | undefined
}
/**
 * Reactive Memory Info.
 *
 * Map from @vueuse/core `useMemory`
 * (`source/vueuse/packages/core/useMemory/`), which reads the Chromium-only
 * non-standard `performance.memory` and keeps it fresh through a scheduler
 * (upstream default: `useIntervalFn`, 1000 ms). Reactive memory info as an
 * object mirroring the upstream `{ isSupported, memory }` members.
 *
 * React divergences:
 * - the Vue `ShallowRef<MemoryInfo | undefined>` return becomes a plain
 *   `MemoryInfo | undefined` state, so read `memory` directly instead of
 *   `watch`ing it;
 * - `isSupported` (upstream `useSupported`) becomes a plain boolean that
 *   starts `false` and is computed in the mount effect, so nothing touches
 *   `performance` during render (SSR-safe);
 * - the first memory read happens in the mount effect (upstream: lazily on
 *   the first scheduler tick);
 * - the `scheduler` option is called during render to compose the polling
 *   loop, so it must be passed consistently across renders (Rules of Hooks);
 *   the loop it returns is paused in an effect while the API is unsupported
 *   and resumed once support is detected, so an unsupported environment never
 *   keeps a timer polling (upstream instead skips composing the scheduler).
 *
 * @see https://vueuse.org/core/useMemory/
 * @param options
 *
 * @example
 * const { isSupported, memory } = useMemory()
 */
export declare function useMemory(options?: UseMemoryOptions): UseMemoryReturn
```
