---
category: Utilities
---

# useDebounceFn

Debounce execution of a function — React port of VueUse's [`useDebounceFn`](https://vueuse.org/shared/useDebounceFn/).

**Mapping:** upstream wraps the function with `createFilterWrapper(debounceFilter(ms, options), fn)`, so every call returns a promise and the wrapper carries `cancel` / `flush` / `isPending`. In React the wrapper is built once (`useMemo`) so its identity is stable across renders; the latest `fn` / `ms` / `options` are kept in refs so every call sees fresh values. `ms` accepts a number, a ref-like `{ current }` or a getter (upstream: `MaybeRefOrGetter<number>`) and is re-read on every call. `isPending` becomes a non-reactive getter (React has no reactive refs), and pending timers are cleared when the component unmounts.

## Usage

```tsx
import { useDebounceFn } from '@reaxuse/shared'

const debouncedFn = useDebounceFn(() => {
  // ...
}, 1000)

debouncedFn()
debouncedFn.cancel()
debouncedFn.flush()
```

<DemoContainer name="UseDebounceFn" />

## Type Declarations

```ts
export interface DebounceFilterOptions {
  maxWait?: MaybeRef<number> | (() => number)
  rejectOnCancel?: boolean
}

export interface UseDebounceFnReturn<T extends FunctionArgs> {
  (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>>
  cancel: () => void
  flush: () => void
  readonly isPending: boolean
}

export function useDebounceFn<T extends FunctionArgs>(
  fn: T,
  ms?: MaybeRef<number> | (() => number),
  options?: DebounceFilterOptions,
): UseDebounceFnReturn<T>
```

## Source

- VueUse: [`packages/shared/useDebounceFn`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useDebounceFn)
- reaxuse: [`packages/shared/src/useDebounceFn.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useDebounceFn.ts)

<Contributors name="useDebounceFn" />
