import type { MaybeRef } from './index'

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

function defaultComparator<T>(value: T, othVal: T) {
  return value === othVal
}

function isRefLike<T>(value: MaybeRef<T>): value is { current: T } {
  return typeof value === 'object' && value !== null && 'current' in value
}

function toValue<T>(value: MaybeRef<T>): T {
  return isRefLike(value) ? value.current : value
}

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

/**
 * React port of VueUse's `useArrayDifference`.
 *
 * Map from @vueuse/shared `useArrayDifference`
 * Mapping: upstream wraps the diff passes in `computed(...)` and returns a
 * `ComputedRef`; React has no reactive value tracking, so this is a plain
 * function recomputed on every render — pass state arrays (upstream: reactive
 * arrays) and the difference is re-diffed on the next render, no `.value` on
 * the result. The same three call shapes as upstream are supported: plain
 * diff, diff by `key`, and diff by `compareFn`, plus the `{ symmetric }`
 * option. Vue refs map to the repo's `MaybeRef` (`{ current }`) objects: the
 * lists themselves may be ref-like and every element is unwrapped before the
 * comparator runs.
 *
 * @see https://vueuse.org/shared/useArrayDifference/
 *
 * @example
 * const list = [{ id: 1 }, { id: 2 }, { id: 3 }]
 * useArrayDifference(list, [{ id: 3 }]) // [{ id: 1 }, { id: 2 }]
 * useArrayDifference(list, [{ id: 3 }], 'id') // diff by key
 * useArrayDifference(list, [{ id: 3 }], (a, b) => a.id === b.id, { symmetric: true })
 */
export function useArrayDifference<T>(...args: any[]): UseArrayDifferenceReturn<T> {
  const list: MaybeRef<MaybeRef<T>[]> = args[0]
  const values: MaybeRef<MaybeRef<T>[]> = args[1]

  let compareFn = args[2] ?? defaultComparator
  const {
    symmetric = false,
  } = args[3] ?? {}

  if (typeof compareFn === 'string') {
    const key = compareFn as keyof T
    compareFn = (value: T, othVal: T) => value[key] === othVal[key]
  }

  const listArray = isRefLike(list) ? list.current : list
  const valuesArray = isRefLike(values) ? values.current : values

  const diff1 = listArray
    .filter(x => valuesArray.findIndex(y => compareFn(toValue(x), toValue(y))) === -1)
    .map(x => toValue(x))

  if (symmetric) {
    const diff2 = valuesArray
      .filter(x => listArray.findIndex(y => compareFn(toValue(x), toValue(y))) === -1)
      .map(x => toValue(x))
    return [...diff1, ...diff2]
  }
  else {
    return diff1
  }
}
