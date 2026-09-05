import type { MaybeRef } from './index'

export type UseArrayFilterReturn<T = any> = T[]

function unref<T>(value: MaybeRef<T>): T {
  return value !== null && typeof value === 'object' && 'current' in value
    ? (value as { current: T }).current
    : value
}

/**
 * Reactive `Array.filter`
 *
 * React port of VueUse's `useArrayFilter`.
 *
 * Mapping: Vue's `computed` → recompute per render and return a plain array
 * (no `.value`); `MaybeRefOrGetter` → `MaybeRef` (`T | { current: T }`).
 * Pass a `useState` array directly — the filtered result updates on the next
 * render. The list itself may be ref-like and every element is unwrapped
 * before the predicate runs.
 *
 * @see https://vueuse.org/shared/useArrayFilter/
 *
 * @example
 * const [list, setList] = useState([0, 1, 2, 3, 4])
 * const evens = useArrayFilter(list, i => i % 2 === 0) // [0, 2, 4]
 * setList([1, 2, 3]) // evens === [2] on the next render
 */
export function useArrayFilter<T, S extends T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: T[]) => element is S,
): UseArrayFilterReturn<S>
export function useArrayFilter<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: T[]) => unknown,
): UseArrayFilterReturn<T>
export function useArrayFilter<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: T[]) => unknown,
): UseArrayFilterReturn<T> {
  return unref(list).map(element => unref(element)).filter(fn)
}
