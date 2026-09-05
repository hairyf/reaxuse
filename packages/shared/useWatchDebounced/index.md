---
category: Watch
---

# useWatchDebounced

Debounced watch. The callback will only be invoked after the source stops changing
for the specified duration — React port of VueUse's
[`watchDebounced`](https://vueuse.org/shared/watchDebounced/).

**Mapping:** upstream is a shorthand for `watchWithFilter` with a `debounceFilter`
event filter. This port composes the same pieces from house primitives: `useWatch`
tracks the source across renders (the effect dependency list replaces Vue's reactive
dependency tracking) and hands every change to `useDebounceFn` (upstream's
`debounceFilter`, including `maxWait`). Bursts of changes collapse into a single call
carrying the latest `(value, oldValue)` pair, and pending timers are cancelled on
unmount — there is no stop handle.

## Usage

Similar to `useWatch`, but offering extra options `debounce` and `maxWait` which will
be applied to the callback function.

```tsx
import { useWatchDebounced } from '@reaxuse/shared'

useWatchDebounced(
  input,
  () => { console.log('changed!') },
  { debounce: 500, maxWait: 1000 },
)
```

### Options

| Option     | Type                                 | Default | Description                                |
| ---------- | ------------------------------------ | ------- | ------------------------------------------ |
| `debounce` | `MaybeRef<number> \| (() => number)` | `0`     | Debounce delay in ms (can be reactive)     |
| `maxWait`  | `MaybeRef<number> \| (() => number)` | —       | Maximum wait time before forced invocation |

Fire the callback once on mount with the current value (still debounced):

```tsx
import { useWatchDebounced } from '@reaxuse/shared'

useWatchDebounced(input, () => console.log('changed!'), { immediate: true })
```

<DemoContainer name="UseWatchDebounced" />

## Type Declarations

```ts
export interface UseWatchDebouncedOptions extends DebounceFilterOptions {
  debounce?: MaybeRef<number> | (() => number)
  immediate?: boolean
}

export function useWatchDebounced<T extends any[]>(source: readonly [...T], callback: UseWatchCallback<[...T]>, options?: UseWatchDebouncedOptions): void
export function useWatchDebounced<T>(source: T, callback: UseWatchCallback<T>, options?: UseWatchDebouncedOptions): void
```

## Source

- VueUse: [`packages/shared/watchDebounced`](https://github.com/vueuse/vueuse/tree/main/packages/shared/watchDebounced) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchDebounced/index.ts), tests [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchDebounced/index.test.ts) mirrored in [`packages/shared/src/useWatchDebounced.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchDebounced.test.tsx)
- reaxuse: [`packages/shared/src/useWatchDebounced.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchDebounced.ts)

<Contributors name="useWatchDebounced" />
