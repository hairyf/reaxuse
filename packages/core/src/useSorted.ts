import { useMemo } from 'react'

/**
 * Compare function contract of `Array.prototype.sort`: return a negative
 * number to place `a` before `b`, a positive number to place `a` after `b`,
 * and `0` (or `NaN`) to keep their relative order — the sort is stable.
 */
export type UseSortedCompareFn<T = any> = (a: T, b: T) => number

const defaultCompare: UseSortedCompareFn<any> = (a, b) => a - b

/**
 * React port of VueUse's `useSorted`.
 *
 * Map from @vueuse/core `useSorted`
 * (`source/vueuse/packages/core/useSorted/`). Reactive sort array — returns a
 * sorted copy of the source (upstream:
 * `computed(() => sortFn([...toValue(source)], compareFn))`), so the original
 * array is never mutated.
 *
 * Adjustments from upstream (Vue reactivity does not translate 1:1):
 *
 * 1. Plain value, not a `Ref` — the sorted array is recomputed with
 *    `useMemo` whenever the source array identity or `compareFn` changes
 *    (upstream re-sorts through Vue's reactivity). Pass a getter
 *    (`() => T[]`) to resolve the array at render time.
 * 2. `UseSortedOptions` is not ported — pass the compare function as the
 *    second positional argument. Upstream's `dirty` flag sorts the source
 *    array in place by writing back through the Vue ref, which contradicts
 *    React's immutable-update contract (an in-place mutation would not
 *    trigger a re-render); the custom `sortFn` algorithm option is dropped
 *    along with it.
 * 3. The default comparator is numeric (`(a, b) => a - b`, upstream parity) —
 *    supply an explicit comparator to sort strings.
 *
 * @example
 * const sorted = useSorted([10, 3, 5, 7, 2, 1, 8, 6, 9, 4])
 * // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] — source untouched
 *
 * const objSorted = useSorted(objArr, (a, b) => a.age - b.age)
 */
export function useSorted<T = any>(source: T[] | (() => T[]), compareFn?: UseSortedCompareFn<T>): T[] {
  const resolved = typeof source === 'function' ? source() : source

  return useMemo(
    () => [...resolved].sort(compareFn ?? defaultCompare),
    [resolved, compareFn],
  )
}
