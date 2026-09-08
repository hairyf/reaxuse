---
category: Reactivity
---

# useStateDebounced

Debounce execution of a state value — React port of VueUse's [`refDebounced`](https://vueuse.org/shared/refDebounced/).

**Mapping:** upstream `refDebounced(ref, ms, options)` takes a Vue `Ref<T>` and returns a readonly
ref that only flips to the latest source value once it stops changing for `ms` (a watcher hands every
change to `useDebounceFn`). The naming follows this repo's `ref* → useState*` rule
(`refDebounced` → `useStateDebounced`), the Vue `Ref<T>` input becomes a plain initial value, and the
readonly ref becomes an extra state slot — so the hook returns the tuple `[value, setValue, debounced]`.
`value` is the source state, `setValue` its setter, and `debounced` lags behind it by `ms`; a burst of
writes collapses into a single trailing update carrying the last written value.

## Usage

```tsx
import { useStateDebounced } from '@reaxuse/shared'

const [input, setInput, debounced] = useStateDebounced('foo', 1000)

setInput('bar')
console.log(debounced) // 'foo' — flips to 'bar' once the debounce elapses
```

<DemoContainer name="UseStateDebounced" />

## Type Declarations

```ts
export type UseStateDebouncedReturn<T> = [
  value: T,
  setValue: Dispatch<SetStateAction<T>>,
  debounced: T,
]

export function useStateDebounced<T>(
  value: T,
  ms?: number | { current: number } | (() => number),
  options?: DebounceFilterOptions,
): UseStateDebouncedReturn<T>
```

## Source

- VueUse: [`packages/shared/refDebounced`](https://github.com/vueuse/vueuse/tree/main/packages/shared/refDebounced) (source: `index.ts` + `demo.vue`)
- reaxuse: [`packages/shared/src/useStateDebounced.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useStateDebounced.ts)

<Contributors name="useStateDebounced" />
