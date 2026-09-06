---
category: Array
---

# useSorted

Reactive sorted array — React port of VueUse's [`useSorted`](https://vueuse.org/core/useSorted/).

**Mapping:** upstream `computed(() => sortFn([...toValue(source)], compareFn))` becomes `useMemo`
recomputing a sorted copy of the source — the source array is never mutated (upstream default
non-dirty mode). In React the recompute happens whenever the source array identity or the compare
function changes.

## Usage

```tsx
import { useSorted } from '@reaxuse/core'

// general sort — the default comparator is numeric: (a, b) => a - b
const sorted = useSorted([10, 3, 5, 7, 2, 1, 8, 6, 9, 4])
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] — source untouched

// object sort
const objArr = [{
  name: 'John',
  age: 40,
}, {
  name: 'Jane',
  age: 20,
}, {
  name: 'Joe',
  age: 30,
}, {
  name: 'Jenny',
  age: 22,
}]
const objSorted = useSorted(objArr, (a, b) => a.age - b.age)

// getter source
const stateSorted = useSorted(() => items)
```

### React adjustments

- **Plain value, not a `Ref`** — returns a sorted `T[]` (no `.value`), recomputed with `useMemo`
  when the source array identity or `compareFn` changes. Pass a getter (`() => T[]`) to resolve the
  array at render time.
- **No `UseSortedOptions`** — the compare function is a positional argument. Upstream's `dirty`
  flag sorts the source array in place by writing back through the Vue ref, which contradicts
  React's immutable-update contract (an in-place mutation would not trigger a re-render); the
  custom `sortFn` algorithm option is dropped along with it.
- **Numeric default comparator** — upstream parity: `(a, b) => a - b`. Supply an explicit
  comparator to sort strings.
- **Stable sort** — elements that compare equal keep their relative order
  (`Array.prototype.sort` is stable per spec).

<DemoContainer name="UseSorted" />

## Type Declarations

```ts
export type UseSortedCompareFn<T = any> = (a: T, b: T) => number

export function useSorted<T = any>(source: T[] | (() => T[]), compareFn?: UseSortedCompareFn<T>): T[]
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useSorted/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSorted/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSorted/index.browser.test.ts) (tests mirrored in `packages/core/src/useSorted.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSorted/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useSorted.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useSorted.ts), docs + demo co-located in `packages/core/useSorted/`

<Contributors name="useSorted" />
