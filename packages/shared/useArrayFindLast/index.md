---
category: Array
---

# useArrayFindLast

Reactive `Array.findLast` — React port of VueUse's [`useArrayFindLast`](https://vueuse.org/shared/useArrayFindLast/).

**Mapping:** upstream wraps native `Array.prototype.findLast` (with a loop fallback for runtimes
without it) in `computed(() => ...)` and returns a `ComputedRef`; React has no implicit reactivity,
so `useArrayFindLast` is a plain function recomputed on every render. Refs map to `{ current }`
objects: elements are unwrapped before the predicate runs, the last match is returned unwrapped,
and mutations show up on the next render.

## Usage

```tsx
import { useArrayFindLast } from '@reaxuse/shared'

const list = [{ current: 1 }, { current: -1 }, { current: 2 }]
const positive = useArrayFindLast(list, val => val > 0) // 2

list[2].current = -2 // positive === 1 on the next render
```

<DemoContainer name="UseArrayFindLast" />

## Type Declarations

```ts
export type UseArrayFindLastReturn<T = any> = T | undefined

export function useArrayFindLast<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: MaybeRef<T>[]) => boolean,
): UseArrayFindLastReturn<T>
```

## Source

- VueUse: [`packages/shared/useArrayFindLast/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayFindLast/index.ts)
- VueUse tests: [`packages/shared/useArrayFindLast/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayFindLast/index.test.ts)
- reaxuse: [`packages/shared/src/useArrayFindLast.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useArrayFindLast.ts)

<Contributors name="useArrayFindLast" />
