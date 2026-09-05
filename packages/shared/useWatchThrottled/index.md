---
category: Watch
---

# useWatchThrottled

Throttled watch. The callback will be invoked at most once per specified duration —
React port of VueUse's
[`watchThrottled`](https://vueuse.org/shared/watchThrottled/).

**Mapping:** upstream is a shorthand for `watchWithFilter` with a `throttleFilter`
event filter. This port composes the same pieces from house primitives: `useWatch`
tracks the source across renders (the effect dependency list replaces Vue's reactive
dependency tracking) and hands every change to `useThrottleFn` (upstream's
`throttleFilter`, including `leading` / `trailing`). Changes inside the throttle
window collapse into a single call carrying the latest `(value, oldValue)` pair, and
pending timers are cancelled on unmount — there is no stop handle.

## Usage

Similar to `useWatch`, but offering extra options `throttle`, `trailing`, and
`leading` which will be applied to the callback function.

```tsx
import { useWatchThrottled } from '@reaxuse/shared'

useWatchThrottled(
  input,
  () => { console.log('changed!') },
  { throttle: 500 },
)
```

### Options

| Option     | Type                                 | Default | Description                               |
| ---------- | ------------------------------------ | ------- | ----------------------------------------- |
| `throttle` | `MaybeRef<number> \| (() => number)` | `0`     | Throttle interval in ms (can be reactive) |
| `trailing` | `boolean`                            | `true`  | Invoke on the trailing edge               |
| `leading`  | `boolean`                            | `true`  | Invoke on the leading edge                |

### Leading and Trailing

Control when the callback is invoked:

```tsx
import { useWatchThrottled } from '@reaxuse/shared'

// Only invoke at the start of each throttle period
useWatchThrottled(source, callback, {
  throttle: 500,
  leading: true,
  trailing: false,
})

// Only invoke at the end of each throttle period
useWatchThrottled(source, callback, {
  throttle: 500,
  leading: false,
  trailing: true,
})
```

Fire the callback once on mount with the current value (still throttled):

```tsx
import { useWatchThrottled } from '@reaxuse/shared'

useWatchThrottled(input, () => console.log('changed!'), { immediate: true })
```

<DemoContainer name="UseWatchThrottled" />

## Type Declarations

```ts
export interface UseWatchThrottledOptions {
  throttle?: MaybeRef<number> | (() => number)
  trailing?: boolean
  leading?: boolean
  immediate?: boolean
}

export function useWatchThrottled<T extends any[]>(source: readonly [...T], callback: UseWatchCallback<[...T]>, options?: UseWatchThrottledOptions): void
export function useWatchThrottled<T>(source: T, callback: UseWatchCallback<T>, options?: UseWatchThrottledOptions): void
```

## Source

- VueUse: [`packages/shared/watchThrottled`](https://github.com/vueuse/vueuse/tree/main/packages/shared/watchThrottled) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchThrottled/index.ts), tests [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchThrottled/index.test.ts) mirrored in [`packages/shared/src/useWatchThrottled.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchThrottled.test.tsx)
- reaxuse: [`packages/shared/src/useWatchThrottled.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchThrottled.ts)

<Contributors name="useWatchThrottled" />
