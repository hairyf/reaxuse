---
category: '@RxJS'
---

# useWatchExtractedObservable

Watch the values of an RxJS [`Observable`](https://rxjs.dev/guide/observable) as extracted from one or more hooks.

Automatically unsubscribe on observable change, and automatically unsubscribe from it when the component is unmounted.

## Usage

```tsx
import type { Observable } from 'rxjs'
import { useWatchExtractedObservable } from '@reause/rxjs'
import { useState } from 'react'
import { Subject } from 'rxjs'

interface Player {
  progress$: Observable<number>
}

export function PlayerProgress() {
  const [player] = useState<Player>(() => ({ progress$: new Subject<number>() }))
  const [progress, setProgress] = useState(0)

  const { stop } = useWatchExtractedObservable(player, p => p.progress$, setProgress)

  return (
    <div>
      <p>{progress}</p>
      <button onClick={() => stop()}>Stop watching</button>
    </div>
  )
}
```

If you want to add custom error handling to an `Observable` that might error, you can supply an optional `onError` configuration. Without this, RxJS will treat any error in the supplied `Observable` as an "unhandled error" and it will be thrown in a new call stack and reported to `window.onerror` (or `process.on('error')` if you happen to be in Node).

You can also supply an optional `onComplete` configuration if you need to attach special behavior when the watched observable completes.

```tsx
useWatchExtractedObservable(player, p => p.progress$, setProgress, {
  onError: (err: unknown) => {
    console.error(err)
  },
  onComplete: () => {
    setProgress(100) // or 0, or whatever
  },
})
```

## Subscription Options

| Option       | Type                     | Description                          |
| ------------ | ------------------------ | ------------------------------------ |
| `onError`    | `(err: unknown) => void` | Error handler for Observable errors  |
| `onComplete` | `() => void`             | Called when the Observable completes |

## Return Value

Returns a `WatchHandle` that can be used to stop watching:

```tsx
const { stop } = useWatchExtractedObservable(player, p => p.progress$, setProgress)

// Later, stop watching
stop()
```

## Type Declarations

```ts
/**
 * Register a cleanup callback for the current extractor run. Mirrors Vue's
 * `watch` cleanup hook: the registered callbacks run before the next
 * subscription is created and when the hook is torn down (`stop()` /
 * unmount).
 */
export type OnCleanup = (cleanupFn: () => void) => void
/**
 * Extracts the `Observable` to watch from the resolved source value.
 *
 * Note the parameter list is `(value, onCleanup)` — upstream's extractor also
 * receives Vue's `oldValue` between the two; React has no previous-value
 * tracking for arbitrary sources, so that argument is intentionally absent
 * (see the JSDoc of {@link useWatchExtractedObservable}).
 */
export type WatchExtractedObservableExtractor<Value, E> = (
  value: NonNullable<Value>,
  onCleanup: OnCleanup,
) => Observable<E>
export interface UseWatchExtractedObservableOptions {
  /**
   * Extra React effect dependencies — the React substitute for Vue's
   * reactive tracking (same convention as `useAsync`'s `options.deps`,
   * `packages/core/useAsync/index.tsx`). The resolved source value's
   * identity is always compared as well, so a new source object re-extracts
   * even without `deps`. Defaults to `[]`.
   */
  deps?: unknown[]
  /**
   * Error handler forwarded to the `Observable` subscription. Without it
   * RxJS treats an error as unhandled and rethrows it asynchronously
   * (upstream parity).
   */
  onError?: (err: unknown) => void
  /** Called when the watched `Observable` completes. */
  onComplete?: () => void
}
export interface UseWatchExtractedObservableReturn {
  /**
   * Stop watching: runs the pending `onCleanup` callbacks, unsubscribes the
   * active subscription and detaches the hook permanently (upstream's
   * `WatchHandle`). Idempotent — later `deps` / source changes no longer
   * subscribe.
   */
  stop: () => void
}
/**
 * Watch the values of an RxJS [`Observable`](https://rxjs.dev/guide/observable)
 * extracted from a source value — React port of VueUse's
 * `watchExtractedObservable`.
 *
 * Map from @vueuse/rxjs `watchExtractedObservable`
 * (`source/vueuse/packages/rxjs/watchExtractedObservable/`): whenever the
 * resolved source value changes, the previous subscription is unsubscribed
 * and `extractor` derives a new `Observable`, whose emissions are forwarded
 * to `callback`. Automatically unsubscribes when the source changes and when
 * the component unmounts.
 *
 * React adaptation (upstream's Vue reactivity graph is replaced):
 *
 * - `value` is a read-only value source and takes a plain
 *   `Value | null | undefined` (upstream: `T | WatchSource<T>`; resolve a
 *   React ref or getter at the call site). There
 *   is no reactive graph: the effect re-runs when the value's
 *   identity changes **or** when `options.deps` change (upstream re-runs
 *   whenever the tracked source mutates). A source object mutated **in place**
 *   therefore does not re-trigger — pass a new identity or list the mutation
 *   inputs in `deps`. `deps` is the React substitute for Vue's reactive
 *   tracking, the same convention as `useAsync`'s `options.deps`
 *   (`packages/core/useAsync/index.tsx`).
 * - The extractor is `(value, onCleanup) => Observable<E>`: upstream also
 *   passes Vue's `oldValue` as the second argument, which has no React
 *   equivalent (React keeps no previous-value tracking) and is dropped.
 * - Upstream returns a `WatchHandle` function; the React hook returns
 *   `{ stop }` (§2B object return — no state-like writable pair). `stop` is a
 *   stable `useCallback`, idempotent, and — like the `WatchHandle` — permanent:
 *   it tears down the current subscription, runs the pending `onCleanup`
 *   callbacks, and prevents later `deps` / source changes from subscribing
 *   again.
 * - `onCleanup` parity: callbacks registered through the `onCleanup` argument
 *   are collected per run and invoked before the next subscription is created
 *   (upstream's Vue `watch` runs the previous cleanup before the watcher body
 *   unsubscribes) and on unmount / `stop()`. They run before the subscription
 *   is unsubscribed, mirroring upstream's ordering.
 * - A `null` / `undefined` resolved value subscribes to nothing and drops any
 *   previous subscription (upstream parity).
 * - `extractor`, `callback`, `onError` and `onComplete` are read through
 *   latest-value refs, so inline identities never re-subscribe; only the
 *   resolved source value and `deps` do.
 *
 * @see https://vueuse.org/watchExtractedObservable/
 * @example
 * const player = useRef<AudioPlayer | null>(null)
 * const [progress, setProgress] = useState(0)
 *
 * useWatchExtractedObservable(player, p => p.progress$, (percentage) => {
 *   setProgress(percentage * 100)
 * }, { onError: err => console.error(err) })
 */
export declare function useWatchExtractedObservable<Value, E>(
  value: Value | null | undefined,
  extractor: WatchExtractedObservableExtractor<Value, E>,
  callback: (snapshot: E) => void,
  options?: UseWatchExtractedObservableOptions,
): UseWatchExtractedObservableReturn
```
