---
category: Watch
---

# useWatchImmediate

Shorthand for watching value with `{ immediate: true }`

## Usage

Similar to `useWatch`, but the callback also fires once on mount with the
current value.

```tsx
import { useWatchImmediate } from '@reause/shared'
import { useState } from 'react'

const [obj, setObj] = useState('vue-use')

// logs 'vue-use' on mount, then the new value on every change
useWatchImmediate(obj, (updated) => {
  console.log(updated)
})

// later, from an event handler:
setObj('VueUse') // logs 'VueUse'
```

`useWatchImmediate` takes no options — `immediate` is always `true`, and
upstream's `deep`/`flush`/`once` are not ported (tracking is by `Object.is`
identity and effects always run after commit). It returns `void`: upstream's
`WatchHandle.stop()` is not provided — watching ends when the component
unmounts.

## Type Declarations

```ts
/**
 * Shorthand for watching value with `{ immediate: true }` — React port of
 * VueUse's `watchImmediate`.
 *
 * Map from @vueuse/shared watchImmediate. Upstream is a shorthand for
 * `watch(source, cb, { ...options, immediate: true })`; this port composes
 * the same pieces from house primitives: `useWatch` tracks the source across
 * renders (Vue's reactive dependency tracking becomes the effect dependency
 * list) and the hardcoded `immediate: true` fires the callback once on mount
 * with the current value, then again on every subsequent change with
 * `(value, oldValue)`.
 *
 * Divergences from the upstream Vue API:
 * - Returns `void` — upstream returns a `WatchHandle`; here disposal follows
 *   the component lifecycle.
 * - The source is a plain value (or array of values) tracked across renders —
 *   Vue's `WatchSource` forms (ref / getter / reactive) have no React
 *   equivalent, compute the value during render and pass it directly.
 * - The remaining upstream options are not ported — `immediate` is the whole
 *   point of this shorthand and is always `true`, while `deep` and `flush`
 *   don't apply (tracking is by `Object.is` identity, like a Vue ref
 *   reassignment, and effects always run after commit).
 *
 * @example
 * ```ts
 * // logs on mount ('vue-use') and again on every change ('VueUse', ...)
 * useWatchImmediate(obj, updated => console.log(updated))
 * useWatchImmediate([count, name], (value, oldValue) => console.log(value, oldValue))
 * ```
 */
export declare function useWatchImmediate<T extends any[]>(
  source: readonly [...T],
  callback: UseWatchCallback<[...T]>,
): void
export declare function useWatchImmediate<T>(
  source: T,
  callback: UseWatchCallback<T>,
): void
```
