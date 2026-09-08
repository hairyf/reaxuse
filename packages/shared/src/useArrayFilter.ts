import type { RefOrValue } from './index'
import { toValue } from './utils'

export type UseArrayFilterReturn<T = any> = T[]

/**
 * Reactive `Array.filter`
 *
 * Map from @vueuse/shared `useArrayFilter`
 * React port of VueUse's `useArrayFilter`.
 *
 * Mapping: Vue's `computed` → recompute per render and return a plain array
 * (no `.value`); `RefOrValue` → `RefOrValue` (`T | Ref<T>`).
 * Pass a `useState` array directly — the filtered result updates on the next
 * render. The list itself may be a ref and every element is unwrapped
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
  list: RefOrValue<RefOrValue<T>[]>,
  fn: (element: T, index: number, array: T[]) => element is S,
): UseArrayFilterReturn<S>
export function useArrayFilter<T>(
  list: RefOrValue<RefOrValue<T>[]>,
  fn: (element: T, index: number, array: T[]) => unknown,
): UseArrayFilterReturn<T>
export function useArrayFilter<T>(
  list: RefOrValue<RefOrValue<T>[]>,
  fn: (element: T, index: number, array: T[]) => unknown,
): UseArrayFilterReturn<T> {
  return toValue(list).map(element => toValue(element)).filter(fn)
}
