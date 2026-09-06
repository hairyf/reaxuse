import type { MaybeRef } from './index'

export type UseArrayMapReturn<T = any> = T[]

function unref<T>(value: MaybeRef<T>): T {
  return value !== null && typeof value === 'object' && 'current' in value
    ? (value as { current: T }).current
    : value
}

/**
 * Reactive `Array.map`
 *
 * Map from @vueuse/shared `useArrayMap`
 * React port of VueUse's `useArrayMap`.
 *
 * Mapping: Vue's `computed` → recompute per render and return a plain array
 * (no `.value`); `MaybeRefOrGetter` → `MaybeRef` (`T | { current: T }`).
 * Pass a `useState` array directly — the result updates on the next render.
 *
 * @example
 * const [list, setList] = useState([0, 1, 2, 3, 4])
 * const result = useArrayMap(list, i => i * 2) // [0, 2, 4, 6, 8]
 * setList(list.slice(0, -1)) // result === [0, 2, 4, 6] on the next render
 */
export function useArrayMap<T, U = T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: T[]) => U,
): UseArrayMapReturn<U> {
  return unref(list).map(element => unref(element)).map(fn)
}
