import type { RefOrValue } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * `OR` conditions for refs.
 *
 * Map from @vueuse/math `logicOr`
 * (`source/vueuse/packages/math/logicOr/`). Compute the logical `OR` of any
 * number of values.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<boolean>`; the reaxuse version is a pure utility
 * function — all arguments are resolved via `toValue` (plain values or React
 * refs) on every call and the plain
 * boolean result is returned directly, with no effects and no `.value` wrapper
 * (SSR-safe). The caller re-invokes it to react to changing values.
 *
 * @see https://vueuse.org/math/logicOr/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const a = { current: true }
 * const b = { current: false }
 *
 * logicOr(a, b) // true
 *
 * logicOr(true, false) // true
 *
 * @param args - Values or React refs to evaluate.
 * @returns `true` if any argument is truthy, `false` otherwise.
 */
export function logicOr(...args: RefOrValue<any>[]): boolean {
  return args.some(i => toValue(i))
}
