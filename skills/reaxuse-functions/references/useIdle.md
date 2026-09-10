---
category: Sensors
---

# useIdle

Tracks whether the user is being inactive

## Usage

```tsx
import { useIdle } from '@reaxuse/core'

const { idle, lastActive, reset } = useIdle(5 * 60 * 1000) // 5 min

console.log(idle) // true or false
```

`reset()` restarts the idle timer without touching `lastActive`.

## Type Declarations

```ts
export interface UseIdleOptions extends ConfigurableWindow {
  /**
   * Event names that listen to for detected user activity
   *
   * @default ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel']
   */
  events?: (keyof WindowEventMap)[]
  /**
   * Listen for document visibility change
   *
   * @default true
   */
  listenForVisibilityChange?: boolean
  /**
   * Initial state of the idle value
   *
   * @default false
   */
  initialState?: boolean
  /**
   * Filter for if events should to be received (upstream:
   * `ConfigurableEventFilter`).
   *
   * @default throttleFilter(50)
   */
  eventFilter?: EventFilter
}
export interface UseIdleReturn {
  idle: boolean
  lastActive: number
  isPending: boolean
  reset: () => void
  stop: () => void
  start: () => void
}
/**
 * React port of VueUse's `useIdle` — tracks whether the user is being
 * inactive.
 *
 * Map from @vueuse/core `useIdle`
 * (`source/vueuse/packages/core/useIdle/`). Returns an object mirroring the
 * upstream members: `{ idle, lastActive, isPending, reset, stop, start }`.
 * `idle` is a plain boolean state (user inactive), `lastActive` the timestamp
 * of the latest activity, and `reset` restarts the idle timer (without
 * touching `lastActive`). Every activity event (default:
 * `mousemove`/`mousedown`/`resize`/`keydown`/`touchstart`/`wheel` on the
 * window, plus document `visibilitychange`) refreshes `lastActive` and
 * restarts the timer — after `timeout` ms without activity `idle` flips to
 * `true`.
 *
 * React divergences:
 * - the Vue shallow refs returned by upstream become plain values read off
 *   the result object (`idle` is a boolean, `lastActive` a number);
 * - upstream's `useEventListener` + `createFilterWrapper` become a
 *   self-contained mount `useEffect` that registers the listeners (passive)
 *   and removes them on unmount, with each event flowing through the 50ms
 *   `throttleFilter` (options are evaluated once, like upstream's setup);
 * - the idle timer is a `setTimeout` held in a ref and cleared on unmount;
 *   there is no window access during render, so SSR renders the defaults
 *   without starting anything.
 *
 * @example
 * const { idle, lastActive, reset } = useIdle(5 * 60 * 1000) // 5 min
 */
export declare function useIdle(
  timeout?: number,
  options?: UseIdleOptions,
): UseIdleReturn
```
