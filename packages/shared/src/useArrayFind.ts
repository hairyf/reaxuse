import type { MaybeRef } from './index'

export type UseArrayFindReturn<T = any> = T | undefined

function isRefLike<T>(value: MaybeRef<T>): value is { current: T } {
  return typeof value === 'object' && value !== null && 'current' in value
}

function toValue<T>(value: MaybeRef<T>): T {
  return isRefLike(value) ? value.current : value
}

/**
 * React port of VueUse's `useArrayFind`.
 *
 * Mapping: upstream wraps `toValue(list).find(...)` in `computed(() => ...)`
 * and returns a `ComputedRef`; React has no reactive value tracking, so this
 * is a plain function recomputed on every render. Vue refs map to the repo's
 * `MaybeRef` (`{ current }`) objects: the list itself may be ref-like, every
 * element is unwrapped before the predicate runs, and the first match is
 * returned unwrapped. Mutating a ref element or the array does not trigger
 * anything by itself — the new result shows up on the next render.
 *
 * @see https://vueuse.org/shared/useArrayFind/
 *
 * @example
 * const list = [{ current: 1 }, { current: -1 }, { current: 2 }]
 * useArrayFind(list, val => val > 0) // 1
 * list[0].current = 3 // 3 on the next render
 */
export function useArrayFind<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: MaybeRef<T>[]) => boolean,
): UseArrayFindReturn<T> {
  const array = isRefLike(list) ? list.current : list
  const found = array.find((element, index, arr) => fn(toValue(element), index, arr))
  return found === undefined ? undefined : toValue(found)
}
