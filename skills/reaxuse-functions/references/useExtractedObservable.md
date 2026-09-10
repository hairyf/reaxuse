---
category: '@RxJS'
---

# useExtractedObservable

Use an RxJS [`Observable`](https://rxjs.dev/guide/observable) as extracted from one or more hooks, return the latest emitted value, and automatically unsubscribe from it when the component is unmounted.

Automatically unsubscribe on observable change, and automatically unsubscribe from it when the component is unmounted.

The source is a plain value, so the extractor re-runs when its identity changes; `deps` covers a source that is mutated in place.

## Install

```bash
npm i rxjs
```

## Usage

```tsx
import { useExtractedObservable } from '@reaxuse/rxjs'
import { useState } from 'react'
import { interval } from 'rxjs'
import { mapTo, scan, startWith } from 'rxjs/operators'

export function Counter() {
  const [start, setStart] = useState(0)

  const count = useExtractedObservable(start, start => interval(1000).pipe(
    mapTo(1),
    startWith(start),
    scan((total, next) => next + total),
  ))

  return (
    <div>
      <p>
        Counter:
        {count}
      </p>
      <button onClick={() => setStart(0)}>Restart from 0</button>
    </div>
  )
}
```

The subscription is created in an effect: it is unsubscribed whenever the source value changes, and on unmount. Upstream's `watch` options have no React equivalent — the extractor always runs on mount (upstream's `immediate: true` default), and a source object mutated in place is re-extracted by listing the mutation inputs in `deps`:

```tsx
import { useExtractedObservable } from '@reaxuse/rxjs'
import { useState } from 'react'
import { of } from 'rxjs'

const [filters, setFilters] = useState({ status: 'open', limit: 10 })

const label = useExtractedObservable(
  filters,
  filters => of(`${filters.status}: ${filters.limit}`),
  { deps: [filters.status, filters.limit] },
)
```

If you want to add custom error handling to an `Observable` that might error, you can supply an optional `onError` configuration. Without this, RxJS will treat any error in the supplied `Observable` as an "unhandled error" and it will be thrown in a new call stack and reported to `window.onerror` (or `process.on('error')` if you happen to be in Node).

```tsx
import { useExtractedObservable } from '@reaxuse/rxjs'
import { useState } from 'react'
import { interval } from 'rxjs'
import { mapTo, scan, startWith, tap } from 'rxjs/operators'

const [start, setStart] = useState(0)

const count = useExtractedObservable(
  start,
  (start) => {
    return interval(1000).pipe(
      mapTo(1),
      startWith(start),
      scan((total, next) => next + total),
      tap((n) => {
        if (n === 10)
          throw new Error('oops')
      }),
    )
  },
  {
    onError: (err: unknown) => {
      console.log(err) // Error: oops
    },
  },
)
```

You can also supply an optional `onComplete` configuration if you need to attach special behavior when the watched observable completes.

```tsx
import { useExtractedObservable } from '@reaxuse/rxjs'
import { useState } from 'react'
import { interval } from 'rxjs'
import { mapTo, scan, startWith, takeWhile } from 'rxjs/operators'

const [start, setStart] = useState(0)

const count = useExtractedObservable(
  start,
  (start) => {
    return interval(1000).pipe(
      mapTo(1),
      startWith(start),
      scan((total, next) => next + total),
      takeWhile(num => num < 10),
    )
  },
  {
    initialValue: 0,
    onComplete: () => {
      console.log('Done!')
    },
  },
)
```

## Options

| Option         | Type                     | Description                              |
| -------------- | ------------------------ | ---------------------------------------- |
| `initialValue` | `T`                      | Value to use before the Observable emits |
| `onError`      | `(err: unknown) => void` | Error handler for Observable errors      |
| `onComplete`   | `() => void`             | Called when the Observable completes     |
| `deps`         | `unknown[]`              | Extra dependencies that re-extract       |

## Return Value

Returns the latest value emitted by the extracted Observable — a plain value instead of upstream's readonly `ShallowRef`:

```tsx
const count = useExtractedObservable(start, start => interval(1000).pipe(
  startWith(start),
  scan((total, next) => next + total),
))

// `undefined` until the first emission, unless `initialValue` was provided
console.log(count)
```

## Type Declarations

```ts
/**
 * Options for `useExtractedObservable`.
 *
 * Upstream `UseExtractedObservableOptions` extends `UseObservableOptions`
 * with `onComplete`; the React port reuses the same option names (`onError`,
 * `initialValue`) from `useObservable` and adds `deps`, the substitute for
 * Vue's reactive tracking (see {@link useExtractedObservable}).
 */
export interface UseExtractedObservableOptions<
  E,
> extends UseObservableOptions<E> {
  /** Called when the extracted `Observable` completes. */
  onComplete?: () => void
  /**
   * Extra React effect dependencies — the React substitute for Vue's
   * reactive tracking (same convention as `useAsync`'s `options.deps`,
   * `packages/core/useAsync/index.tsx`). The resolved source value's identity
   * is always compared as well, so a new source object re-extracts even
   * without `deps`. Defaults to `[]`.
   */
  deps?: unknown[]
}
/**
 * Extracts the `Observable` to subscribe to from the resolved source value.
 *
 * Note the parameter list is `(value, onCleanup)` — upstream's extractor also
 * receives Vue's `oldValue` between the two; React has no previous-value
 * tracking for arbitrary sources, so that argument is intentionally absent
 * (see the JSDoc of {@link useExtractedObservable}). The signature is shared
 * with the sibling `useWatchExtractedObservable`
 * (`packages/rxjs/useWatchExtractedObservable/index.tsx`).
 */
export type ExtractedObservableExtractor<Value, E> = (
  value: NonNullable<Value>,
  onCleanup: OnCleanup,
) => Observable<E>
/**
 * Use an RxJS [`Observable`](https://rxjs.dev/guide/observable) as extracted
 * from one or more hooks, and automatically unsubscribe from it when the
 * component is unmounted.
 *
 * Map from @vueuse/rxjs `useExtractedObservable`
 * (`source/vueuse/packages/rxjs/useExtractedObservable/`): whenever the
 * resolved source value changes, the previous subscription is unsubscribed
 * and `extractor` derives a new `Observable` from the new value, whose
 * emissions become the hook's value. Unsubscribing happens both on a source
 * change and on unmount.
 *
 * React adaptation (upstream's Vue reactivity graph is replaced):
 *
 * - `value` is a read-only value source and takes a plain
 *   `Value | null | undefined` (upstream: `T | WatchSource<T>`, i.e. a
 *   reactive object, an array of sources or a getter). Resolve a React ref or
 *   getter at the call site; a list of sources is passed as a plain array and
 *   re-extracts when a new array identity arrives. There is no reactive graph:
 *   the effect re-runs when the value's identity changes **or** when
 *   `options.deps` change (upstream re-runs whenever any tracked source
 *   mutates), so a source object mutated **in place** needs a new identity or
 *   the mutation inputs listed in `deps`.
 * - the extractor is `(value, onCleanup) => Observable<E>`: upstream also
 *   passes Vue's `oldValue` as the second argument, which has no React
 *   equivalent (React keeps no previous-value tracking) and is dropped.
 * - upstream returns a `DeepReadonly<ShallowRef<E>>`; the React port returns
 *   the value directly (a readonly ref holds no writable value, so the
 *   structure is mirrored — §2 return rules). `initialValue` narrows the
 *   returned type to `E | I` (`I` being the `initialValue` type and
 *   defaulting to `undefined`), the same trick as `useObservable`.
 * - upstream's `watch` options (`immediate` / `deep` / `flush`) are dropped:
 *   the effect always extracts on mount (`immediate: true`, upstream's
 *   default) and re-extracts on identity / `deps` changes — React has no
 *   flush scheduler to configure. Pass `initialValue` to seed the value
 *   before the first extraction settles.
 * - `initialValue` is the `useState` initial value, so it only applies to the
 *   first render — a later source change keeps the last emitted value
 *   (upstream's `obsRef` is never reset either), and a nullish source
 *   subscribes to nothing and drops the previous subscription.
 * - `onCleanup` parity: callbacks registered through the `onCleanup` argument
 *   are collected per run and invoked before the next subscription is created,
 *   before the previous subscription is unsubscribed (upstream's Vue `watch`
 *   runs the previous cleanup before the watcher body), and on unmount.
 * - `extractor`, `onError` and `onComplete` are read through latest-value refs,
 *   so inline identities never re-subscribe; only the resolved source value
 *   and `deps` do.
 * - the option values are handed to the observer directly, so an absent
 *   `onError` leaves the error slot `undefined` and RxJS reports the error as
 *   unhandled instead of swallowing it (upstream parity).
 * - SSR-safe: nothing touches `window` / `document`, and the subscription only
 *   exists inside the mount effect.
 *
 * @see https://vueuse.org/rxjs/useExtractedObservable/
 * @example
 * const [start, setStart] = useState(0)
 * const count = useExtractedObservable(start, start => interval(1000).pipe(
 *   startWith(start),
 *   scan((total, next) => next + total),
 * ), { initialValue: 0 })
 * // count is 0 until the first emission, then keeps accumulating
 */
export declare function useExtractedObservable<Value, E, I = undefined>(
  value: Value | null | undefined,
  extractor: ExtractedObservableExtractor<Value, E>,
  options?: UseExtractedObservableOptions<E | I>,
): E | I
```
