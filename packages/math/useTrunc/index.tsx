import type { RefOrValue } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * React port of VueUse's `useTrunc`.
 *
 * Map from @vueuse/math `useTrunc`
 * (`source/vueuse/packages/math/useTrunc/`). Reactively truncates a number,
 * removing the fractional digits toward zero.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reaxuse version is a pure derived
 * hook — `value` is resolved (a plain number or a React ref) at render time
 * and the truncated number is returned directly, with
 * no effects and no `.value` wrapper (SSR-safe).
 *
 * @see https://vueuse.org/math/useTrunc/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const value = { current: 0.95 }
 * const result1 = useTrunc(value) // 0
 *
 * value.current = -2.34
 * const result2 = useTrunc(value) // -2
 *
 * @param value - The value to truncate.
 * @returns The truncated number.
 */
export function useTrunc(value: RefOrValue<number>): number {
  return Math.trunc(toValue(value))
}
