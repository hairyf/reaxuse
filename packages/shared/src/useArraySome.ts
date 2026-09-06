import type { MaybeRef } from './index'
import { toValue } from './utils'

export type UseArraySomeReturn = boolean

/**
 * React port of VueUse's `useArraySome`.
 *
 * Map from @vueuse/shared `useArraySome`
 * Mapping: `computed(() => ...)` → recompute on every render — the result is a
 * plain `boolean` (no `.value`, no caching). `MaybeRefOrGetter` → the repo's
 * `MaybeRef` (`T | { current: T }`), unwrapped on read: ref-like elements are
 * re-read on each render, so mutate `ref.current` and re-render to update.
 *
 * @see https://vueuse.org/shared/useArraySome/
 * @param list - the array was called upon (optionally wrapped in a ref-like).
 * @param fn - a function to test each element.
 *
 * @returns **true** if the `fn` function returns a **truthy** value for any element from the array. Otherwise, **false**.
 *
 * @example
 * const [list, setList] = useState([0, 2, 4, 6, 8])
 * const result = useArraySome(list, i => i > 10) // false
 * setList([...list, 11]) // result === true on the next render
 */
export function useArraySome<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: MaybeRef<T>[]) => unknown,
): UseArraySomeReturn {
  const source = toValue(list)
  return source.some((element, index, array) => fn(toValue(element), index, array))
}
