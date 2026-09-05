---
category: Utilities
---

# useThrottleFn

Throttle execution of a function — React port of VueUse's [`useThrottleFn`](https://vueuse.org/shared/useThrottleFn/).

**Mapping:** upstream wraps the function with `createFilterWrapper(throttleFilter(ms, trailing, leading, rejectOnCancel), fn)` and returns a plain `PromisifyFn<T>` — the throttled wrapper carries no `cancel` / `flush` / `isPending` (unlike the debounce filter, upstream's `throttleFilter` is not cancelable). In React the wrapper is built once (`useMemo`) so its identity is stable across renders — safe to add/remove in effects; the latest `fn` / `ms` / flags are kept in refs so every call sees fresh values. `ms` accepts a number, a ref-like `{ current }` or a getter (upstream: `MaybeRefOrGetter<number>`) and is re-read on every call. The throttle filter logic is inlined (upstream `throttleFilter` semantics) and pending timers are cleared when the component unmounts.

## Usage

```tsx
import { useThrottleFn } from '@reaxuse/shared'
import { useEffect } from 'react'

const throttledFn = useThrottleFn(() => {
  // do something, it will be called at most 1 time per second
}, 1000)

useEffect(() => {
  window.addEventListener('resize', throttledFn)
  return () => window.removeEventListener('resize', throttledFn)
}, [throttledFn])
// note: returned fn is referentially stable so effects don't re-subscribe;
// ms accepts a number, a ref-like { current } or a getter
```

<DemoContainer name="UseThrottleFn" />

## Type Declarations

```ts
export type PromisifyFn<T extends FunctionArgs> = (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>

export function useThrottleFn<T extends FunctionArgs>(
  fn: T,
  ms?: MaybeRef<number> | (() => number),
  trailing?: boolean,
  leading?: boolean,
  rejectOnCancel?: boolean,
): PromisifyFn<T>
```

## Source

- VueUse: [`packages/shared/useThrottleFn`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useThrottleFn) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useThrottleFn/index.ts), tests [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useThrottleFn/index.test.ts), demo [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useThrottleFn/demo.vue)
- reaxuse: [`packages/shared/src/useThrottleFn.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useThrottleFn.ts)

<Contributors name="useThrottleFn" />
