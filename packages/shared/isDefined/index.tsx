import type { RefObject } from 'react'
import { isRefLike } from '../utils'

export type IsDefinedReturn = boolean

/**
 * Non-nullish checking type guard for ref-like objects.
 *
 * Map from @vueuse/shared `isDefined`
 * Mapping: upstream narrows a Vue `Ref` / `ComputedRef` itself; this port
 * operates on React ref-like objects (`{ current }`) and narrows `.current`
 * to `Exclude<T, null | undefined>` — upstream's `Ref` and `ComputedRef`
 * overloads collapse into the single ref-like overload below. The
 * plain-value overload keeps upstream parity, so bare values can be guarded
 * with the same call. At runtime a ref-like is detected via `isRefLike`
 * (mirroring upstream's `unref`), so both shapes share one check.
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const example = useRef(Math.random() ? 'example' : undefined) // RefObject<string | undefined>
 *
 * if (isDefined(example))
 *   example.current // string — narrowed by the type guard
 *
 * @see https://vueuse.org/shared/isDefined/
 */
export function isDefined<T>(v: RefObject<T>): v is RefObject<Exclude<T, null | undefined>>
export function isDefined<T>(v: T): v is Exclude<T, null | undefined>
export function isDefined<T>(v: RefObject<T> | T): IsDefinedReturn {
  return (isRefLike(v) ? v.current : v) != null
}
