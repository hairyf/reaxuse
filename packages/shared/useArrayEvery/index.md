---
category: Array
---

# useArrayEvery

Reactive `Array.every` — React port of VueUse's [`useArrayEvery`](https://vueuse.org/shared/useArrayEvery/).

**Mapping:** upstream wraps `toValue(list).every(...)` in `computed(() => ...)` and returns a `ComputedRef`;
React has no implicit reactivity, so `useArrayEvery` is a plain function recomputed on every render.
Refs map to `{ current }` objects: elements are unwrapped before the predicate runs, and mutations
show up on the next render.

## Usage

```tsx
import { useArrayEvery } from '@reaxuse/shared'

const list = [{ current: 0 }, { current: 2 }, { current: 4 }]
const allEven = useArrayEvery(list, val => val % 2 === 0) // true

list[0].current = 1 // allEven === false on the next render
```

<DemoContainer name="UseArrayEvery" />

## Type Declarations

```ts
export type UseArrayEveryReturn = boolean

export function useArrayEvery<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: MaybeRef<T>[]) => unknown,
): UseArrayEveryReturn
```

## Source

- VueUse: [`packages/shared/useArrayEvery/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayEvery/index.ts)
- VueUse tests: [`packages/shared/useArrayEvery/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayEvery/index.test.ts)
- reaxuse: [`packages/shared/src/useArrayEvery.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useArrayEvery.ts)

<Contributors name="useArrayEvery" />
