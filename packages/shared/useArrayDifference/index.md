---
category: Array
---

# useArrayDifference

Reactive `Array.difference` — React port of VueUse's [`useArrayDifference`](https://vueuse.org/shared/useArrayDifference/).

**Mapping:** upstream wraps the diff passes in `computed(...)` and returns a `ComputedRef`;
React has no implicit reactivity, so `useArrayDifference` is a plain function recomputed on
every render — pass state arrays (upstream: reactive arrays) and the difference is re-diffed
on the next render, no `.value` on the result. The same three call shapes as upstream are
supported: plain diff, diff by `key`, and diff by `compareFn`, plus the `{ symmetric }`
option. Refs map to `{ current }` objects: the lists themselves may be ref-like and elements
are unwrapped before the comparator runs.

## Usage

```tsx
import { useArrayDifference } from '@reaxuse/shared'

const list = [1, 2, 3, 4, 5]
const otherList = [4, 5, 6]

const diff = useArrayDifference(list, otherList) // [1, 2, 3]

// diff by key
useArrayDifference(people, otherPeople, 'id')

// diff by compare fn, symmetric difference
useArrayDifference(people, otherPeople, (a, b) => a.id === b.id, { symmetric: true })
```

<DemoContainer name="UseArrayDifference" />

## Type Declarations

```ts
export interface UseArrayDifferenceOptions {
  /**
   * Returns asymmetric difference
   *
   * @see https://en.wikipedia.org/wiki/Symmetric_difference
   * @default false
   */
  symmetric?: boolean
}

export type UseArrayDifferenceReturn<T = any> = T[]

export function useArrayDifference<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  values: MaybeRef<MaybeRef<T>[]>,
  key?: keyof T,
  options?: UseArrayDifferenceOptions,
): UseArrayDifferenceReturn<T>
export function useArrayDifference<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  values: MaybeRef<MaybeRef<T>[]>,
  compareFn?: (value: T, othVal: T) => boolean,
  options?: UseArrayDifferenceOptions,
): UseArrayDifferenceReturn<T>
```

## Source

- VueUse: [`packages/shared/useArrayDifference/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayDifference/index.ts)
- VueUse tests: [`packages/shared/useArrayDifference/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayDifference/index.test.ts)
- reaxuse: [`packages/shared/src/useArrayDifference.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useArrayDifference.ts)

<Contributors name="useArrayDifference" />
