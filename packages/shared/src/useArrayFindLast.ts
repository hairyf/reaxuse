import type { MaybeRef } from './index'

export type UseArrayFindLastReturn<T = any> = T | undefined

function isRefLike<T>(value: MaybeRef<T>): value is { current: T } {
  return typeof value === 'object' && value !== null && 'current' in value
}

function toValue<T>(value: MaybeRef<T>): T {
  return isRefLike(value) ? value.current : value
}

/**
 * Loop equivalent of `Array.prototype.findLast` — upstream ships the same
 * fallback for runtimes without the native method (e.g. node < 18); the repo
 * targets lib ES2022, where the native method is not available.
 */
function findLast<T>(
  array: T[],
  fn: (element: T, index: number, array: T[]) => boolean,
): T | undefined {
  for (let index = array.length - 1; index >= 0; index--) {
    if (fn(array[index], index, array))
      return array[index]
  }
  return undefined
}

/**
 * React port of VueUse's `useArrayFindLast`.
 *
 * Map from @vueuse/shared `useArrayFindLast`
 * Mapping: upstream wraps native `Array.prototype.findLast` (with a loop
 * fallback for runtimes without it) in `computed(() => ...)` and returns a
 * `ComputedRef`; React has no reactive value tracking, so this is a plain
 * function recomputed on every render — the loop helper stands in for the
 * native method since the repo targets lib ES2022. Vue refs map to the
 * repo's `MaybeRef` (`{ current }`) objects: the list itself may be
 * ref-like, every element is unwrapped before the predicate runs, and the
 * last match is returned unwrapped. Mutating a ref element or the array
 * does not trigger anything by itself — the new result shows up on the next
 * render.
 *
 * @see https://vueuse.org/shared/useArrayFindLast/
 *
 * @example
 * const list = [{ current: 1 }, { current: -1 }, { current: 2 }]
 * useArrayFindLast(list, val => val > 0) // 2
 * list[2].current = -2 // 1 on the next render
 */
export function useArrayFindLast<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: MaybeRef<T>[]) => boolean,
): UseArrayFindLastReturn<T> {
  const array = isRefLike(list) ? list.current : list
  const found = findLast(array, (element, index, arr) => fn(toValue(element), index, arr))
  return found === undefined ? undefined : toValue(found)
}
