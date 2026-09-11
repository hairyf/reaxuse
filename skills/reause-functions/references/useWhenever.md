---
category: Watch
---

# useWhenever

Shorthand for watching value to be truthy

## Usage

```tsx
import { useWhenever } from '@reause/shared'

// this
useWhenever(ready, () => console.log(state))

// is equivalent to (the initial mount run is skipped — a plain `useEffect`
// would fire on mount, so add `{ immediate: true }` to fire then too):
useEffect(() => {
  if (ready)
    console.log(state)
}, [ready])
```

With `{ immediate: true }` the callback also fires on mount when the value is already truthy:

```tsx
import { useWhenever } from '@reause/shared'

// this
useWhenever(ready, () => console.log(state), { immediate: true })

// is equivalent to:
useEffect(() => {
  if (ready)
    console.log(state)
}, [ready])
```

### Callback Function

The callback will be called with `cb(value, oldValue)` — upstream's third
`onInvalidate` argument (upstream's effect invalidation registration) is not ported.

```tsx
import { useWhenever } from '@reause/shared'

useWhenever(height, (current, lastHeight) => {
  if (current > lastHeight)
    console.log(`Increasing height by ${current - lastHeight}`)
})
```

### Computed

Same as `watch`, you can pass a getter function to calculate on each change.

```tsx
import { useWhenever } from '@reause/shared'
import { useState } from 'react'

const [counter, setCounter] = useState(0)

// this
useWhenever(counter === 7, () => console.log('counter is 7 now!'))
```

### Options

Fire the callback on mount if the value is already truthy.

```tsx
import { useWhenever } from '@reause/shared'

useWhenever(ready, () => console.log(state), { immediate: true })
```

Only trigger once when the condition is met — the watch stops after the first truthy fire.

```tsx
import { useWhenever } from '@reause/shared'

useWhenever(ready, () => console.log(state), { once: true })
```

## Type Declarations

```ts
export type Truthy<T> = T extends false | null | undefined ? never : T
export interface UseWheneverOptions {
  /**
   * Fire the callback on mount if the value is already truthy
   *
   * @default false
   */
  immediate?: boolean
  /**
   * Only trigger once when the condition is met — the watch stops after the
   * first truthy fire
   *
   * @default false
   */
  once?: boolean
}
/**
 * React port of VueUse's `whenever`.
 *
 * Map from @vueuse/shared `whenever`
 * Mapping: upstream `whenever` is Vue's `watch` plus a truthy guard — the
 * callback runs every time the source CHANGES to a truthy value (a re-render
 * with the same truthy value never fires). In React this becomes a `useEffect`
 * watching `[value]`: the initial mount is skipped unless `immediate` (which
 * fires with `oldValue` `undefined`), later runs fire when the value is truthy
 * and actually changed, and the previous value is tracked in a ref updated on
 * every run — mirroring `watch`'s `oldValue`, which advances through falsy
 * values too. The callback is kept in a ref so re-renders always invoke the
 * newest one.
 *
 * The `once` option stops the watch after the first truthy fire — expressible
 * in React as a one-shot flag consulted by the effect, mirroring upstream's
 * `if (options?.once) nextTick(() => stop())`.
 *
 * The return value is a `stop` function — upstream's `WatchHandle`, reduced to
 * the stop capability (house `useWatch` has no stop-handle infrastructure).
 * `stop()` is also called when the component unmounts.
 *
 * The upstream 3-arg callback `(value, oldValue, onInvalidate)` becomes a
 * 2-arg `(value, oldValue)` in this port — `onInvalidate` (Vue's effect
 * invalidation registration) has no React equivalent, so it is dropped.
 *
 * @see https://vueuse.org/shared/whenever/
 *
 * @example
 * useWhenever(ready, () => console.log(state))
 * useWhenever(ready, () => console.log(state), { immediate: true })
 * useWhenever(ready, () => console.log(state), { once: true })
 */
export declare function useWhenever<T>(
  value: T,
  cb: (value: Truthy<T>, oldValue: T | undefined) => void,
  options?: UseWheneverOptions,
): () => void
```
