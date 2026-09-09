import type { RefOrValue } from '../index'
import { toValue } from '../utils'

export type UseArrayMapReturn<T = any> = T[]

/**
 * Reactive `Array.map`
 *
 * Map from @vueuse/shared `useArrayMap`
 * React port of VueUse's `useArrayMap`.
 *
 * Mapping: Vue's `computed` → recompute per render and return a plain array
 * (no `.value`); `RefOrValue` → `RefOrValue` (`T | Ref<T>`).
 * Pass a `useState` array directly — the result updates on the next render.
 *
 * @example
 * const [list, setList] = useState([0, 1, 2, 3, 4])
 * const result = useArrayMap(list, i => i * 2) // [0, 2, 4, 6, 8]
 * setList(list.slice(0, -1)) // result === [0, 2, 4, 6] on the next render
 */
export function useArrayMap<T, U = T>(
  list: RefOrValue<RefOrValue<T>[]>,
  fn: (element: T, index: number, array: T[]) => U,
): UseArrayMapReturn<U> {
  return toValue(list).map(element => toValue(element)).map(fn)
}
