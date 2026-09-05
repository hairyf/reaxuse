import type { MaybeRef } from './index'

export type UseArrayEveryReturn = boolean

function isRefLike<T>(value: MaybeRef<T>): value is { current: T } {
  return typeof value === 'object' && value !== null && 'current' in value
}

function toValue<T>(value: MaybeRef<T>): T {
  return isRefLike(value) ? value.current : value
}

/**
 * React port of VueUse's `useArrayEvery`.
 *
 * Mapping: upstream wraps `toValue(list).every(...)` in `computed(() => ...)`
 * and returns a `ComputedRef`; React has no reactive value tracking, so this
 * is a plain function recomputed on every render. Vue refs map to the repo's
 * `MaybeRef` (`{ current }`) objects: the list itself may be ref-like, every
 * element is unwrapped before the predicate runs, and the predicate may
 * return any value (coerced by truthiness, like `Array.prototype.every`).
 * Mutating a ref element or the array does not trigger anything by itself —
 * the new result shows up on the next render.
 *
 * @see https://vueuse.org/shared/useArrayEvery/
 *
 * @example
 * const list = [{ current: 0 }, { current: 2 }]
 * useArrayEvery(list, val => val % 2 === 0) // true
 * list[0].current = 1 // false on the next render
 *
 * @param list - the array was called upon.
 * @param fn - a function to test each element.
 *
 * @returns **true** if the `fn` function returns a **truthy** value for every element from the array. Otherwise, **false**.
 */
export function useArrayEvery<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: MaybeRef<T>[]) => unknown,
): UseArrayEveryReturn {
  const array = isRefLike(list) ? list.current : list
  return array.every((element, index, arr) => fn(toValue(element), index, arr))
}
