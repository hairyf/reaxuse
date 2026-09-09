import type { RefOrValue } from '../index'
import { toValue } from '../utils'

export type UseArrayFindReturn<T = any> = T | undefined

/**
 * React port of VueUse's `useArrayFind`.
 *
 * Map from @vueuse/shared `useArrayFind`
 * Mapping: upstream wraps `toValue(list).find(...)` in `computed(() => ...)`
 * and returns a `ComputedRef`; React has no reactive value tracking, so this
 * is a plain function recomputed on every render. Vue refs map to the repo's
 * `RefOrValue` refs: the list itself may be a ref, every
 * element is unwrapped before the predicate runs, and the first match is
 * returned unwrapped. Mutating a ref element or the array does not trigger
 * anything by itself — the new result shows up on the next render.
 *
 * @see https://vueuse.org/shared/useArrayFind/
 *
 * @example
 * const list = [useRef(1), useRef(-1), useRef(2)]
 * useArrayFind(list, val => val > 0) // 1
 * list[0].current = 3 // 3 on the next render
 */
export function useArrayFind<T>(
  list: RefOrValue<RefOrValue<T>[]>,
  fn: (element: T, index: number, array: RefOrValue<T>[]) => boolean,
): UseArrayFindReturn<T> {
  const array = toValue(list)
  const found = array.find((element, index, arr) => fn(toValue(element), index, arr))
  return found === undefined ? undefined : toValue(found)
}
