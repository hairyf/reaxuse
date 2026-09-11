---
category: Array
---

# useSorted

Reactive sorted array

## Usage

```tsx
import { useSorted } from '@reause/core'

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

// options overload — compare function via the options object
const objSorted2 = useSorted(objArr, { compareFn: (a, b) => a.age - b.age })

// options overload — custom sort algorithm (receives a copy + the compareFn)
const reversedSorted = useSorted([3, 1, 2], {
  sortFn: (source, compareFn) => source.sort(compareFn).reverse(),
})

// ref source
const stateSorted = useSorted(itemsRef)
```

### Source Forms

`source` is a read-only value source and takes a plain `readonly T[]` (upstream:
`MaybeRefOrGetter<T[]>`). Resolve a React ref, state tuple or getter at the call site — the hook
never writes the source, so no reactive wrapper is accepted:

```tsx
const [items, setItems] = useState([3, 1, 2])

const sorted = useSorted(items) // re-sorts whenever `items` changes
const sortedRef = useSorted(itemsRef.current) // resolve a React ref at the call site
const sortedPlain = useSorted([3, 1, 2]) // a plain literal works too
```

### React adjustments

- **Plain value, not a `Ref`** — returns a sorted `T[]`, recomputed with `useMemo`
  when the source array identity, `compareFn` or `sortFn` changes. Pass a React ref to resolve the
  array at render time.
- **`UseSortedOptions` partially ported** — the `(source, options)` and `(source, compareFn, options)` overloads are supported with `compareFn` and the pure algorithm option `sortFn` (both plain values, read at render time); a Vue-style `useSorted(source, { compareFn })` call sorts correctly. Upstream's `dirty` option is **not** ported — it sorts the source array in place by writing back through the Vue ref, which contradicts React's immutable-update contract (an in-place mutation would not trigger a re-render). A sorted copy is always returned and the source is never mutated.
- **Numeric default comparator** — upstream parity: `(a, b) => a - b`. Supply an explicit
  comparator to sort strings.
- **Stable sort** — elements that compare equal keep their relative order
  (`Array.prototype.sort` is stable per spec).
