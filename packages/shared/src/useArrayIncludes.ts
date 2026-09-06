import type { MaybeRef } from './index'

export type UseArrayIncludesComparatorFn<T, V> = (element: T, value: V, index: number, array: MaybeRef<T>[]) => boolean

export interface UseArrayIncludesOptions<T, V> {
  fromIndex?: number
  comparator?: UseArrayIncludesComparatorFn<T, V> | keyof T
}

export type UseArrayIncludesReturn = boolean

const toString = Object.prototype.toString

function isObject(val: any): val is object {
  return toString.call(val) === '[object Object]'
}

function containsProp(obj: object, ...props: string[]) {
  return props.some(k => k in obj)
}

function isArrayIncludesOptions<T, V>(obj: any): obj is UseArrayIncludesOptions<T, V> {
  // NOTE: `'formIndex'` mirrors upstream verbatim (a known upstream quirk):
  // an options object is only recognized when it also carries a
  // `comparator`, so pass `{ fromIndex, comparator }` together.
  return isObject(obj) && containsProp(obj, 'formIndex', 'comparator')
}

function isRefLike<T>(value: MaybeRef<T>): value is { current: T } {
  return typeof value === 'object' && value !== null && 'current' in value
}

function toValue<T>(value: MaybeRef<T>): T {
  return isRefLike(value) ? value.current : value
}

/**
 * React port of VueUse's `useArrayIncludes`.
 *
 * Map from @vueuse/shared `useArrayIncludes`
 * Mapping: upstream wraps `toValue(list).slice(fromIndex).some(...)` in
 * `computed(() => ...)` and returns a `ComputedRef`; React has no reactive
 * value tracking, so this is a plain function recomputed on every render.
 * Vue refs map to the repo's `MaybeRef` (`{ current }`) objects: the list
 * itself may be ref-like, both the elements and the search value are
 * unwrapped before the comparator runs, and the default comparator mirrors
 * `Array.prototype.includes` (strict equality). Mutating a ref element or
 * the array does not trigger anything by itself — the new result shows up
 * on the next render.
 *
 * @see https://vueuse.org/shared/useArrayIncludes/
 *
 * @example
 * const list = [{ current: 0 }, { current: 2 }, { current: 4 }]
 * useArrayIncludes(list, 2) // true
 * useArrayIncludes(list, 8) // false
 * useArrayIncludes([{ id: 1 }, { id: 2 }], 2, 'id') // true
 * useArrayIncludes(list, 0, { fromIndex: 1, comparator: (a, b) => a === b }) // false
 *
 * @param list - the array was called upon.
 * @param value - the value to search for.
 * @param comparator - a function to compare elements with, a key of the elements to compare by, or an options object with `fromIndex` and `comparator`.
 *
 * @returns **true** if the `value` is found in the array. Otherwise, **false**.
 */
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
export function useArrayIncludes<T, V = any>(
  ...args: any[]
): UseArrayIncludesReturn {
  const list: MaybeRef<MaybeRef<T>[]> = args[0]
  const value: MaybeRef<V> = args[1]

  let comparator: UseArrayIncludesComparatorFn<T, V> = args[2]
  let formIndex = 0

  if (isArrayIncludesOptions(comparator)) {
    formIndex = comparator.fromIndex ?? 0
    comparator = comparator.comparator!
  }

  if (typeof comparator === 'string') {
    const key = comparator as keyof T
    comparator = (element: T, value: V) => element[key] === toValue(value)
  }

  comparator = comparator ?? ((element: T, value: T) => element === toValue(value))

  const array = isRefLike(list) ? list.current : list
  return array
    .slice(formIndex)
    .some((element, index, arr) => comparator(
      toValue(element),
      toValue(value),
      index,
      arr,
    ))
}
