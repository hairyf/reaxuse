---
category: Array
---

# useArrayIncludes

Reactive `Array.includes` — React port of VueUse's [`useArrayIncludes`](https://vueuse.org/shared/useArrayIncludes/).

**Mapping:** upstream wraps `toValue(list).slice(fromIndex).some(...)` in `computed(() => ...)` and returns a
`ComputedRef`; React has no implicit reactivity, so `useArrayIncludes` is a plain function recomputed on every
render. Refs map to `{ current }` objects: the list itself may be ref-like, elements and the search value are
unwrapped before the comparator runs, and mutations show up on the next render.

## Usage

```tsx
import { useArrayIncludes } from '@reaxuse/shared'

const list = [{ current: 0 }, { current: 2 }, { current: 4 }]
const includes = useArrayIncludes(list, 2) // true

list[0].current = 1 // includes === false on the next render

const objects = [{ id: 1 }, { id: 2 }]
useArrayIncludes(objects, 2, 'id') // true — compare by key
useArrayIncludes(objects, { id: 2 }, (element, value) => element.id === value.id) // true — comparator function
useArrayIncludes(objects, { id: 1 }, { fromIndex: 1, comparator: (element, value) => element.id === value.id }) // false
```

<DemoContainer name="UseArrayIncludes" />

## Type Declarations

```ts
export type UseArrayIncludesComparatorFn<T, V> = (element: T, value: V, index: number, array: MaybeRef<T>[]) => boolean

export interface UseArrayIncludesOptions<T, V> {
  fromIndex?: number
  comparator?: UseArrayIncludesComparatorFn<T, V> | keyof T
}

export type UseArrayIncludesReturn = boolean

export function useArrayIncludes<T, V = any>(
  list: MaybeRef<MaybeRef<T>[]>,
  value: MaybeRef<V>,
  comparator?: UseArrayIncludesComparatorFn<T, V>,
): UseArrayIncludesReturn
export function useArrayIncludes<T, V = any>(
  list: MaybeRef<MaybeRef<T>[]>,
  value: MaybeRef<V>,
  comparator?: keyof T,
): UseArrayIncludesReturn
export function useArrayIncludes<T, V = any>(
  list: MaybeRef<MaybeRef<T>[]>,
  value: MaybeRef<V>,
  options?: UseArrayIncludesOptions<T, V>,
): UseArrayIncludesReturn
```

## Source

- VueUse: [`packages/shared/useArrayIncludes/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayIncludes/index.ts)
- VueUse tests: [`packages/shared/useArrayIncludes/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayIncludes/index.test.ts)
- reaxuse: [`packages/shared/src/useArrayIncludes.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useArrayIncludes.ts)

<Contributors name="useArrayIncludes" />
