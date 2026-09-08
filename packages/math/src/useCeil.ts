import type { MaybeRefOrGetter } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * React port of VueUse's `useCeil`.
 *
 * Map from @vueuse/math `useCeil`
 * (`source/vueuse/packages/math/useCeil/`). Reactive `Math.ceil`.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reaxuse version is a pure derived
 * hook — the value is resolved (plain number, `{ current }` ref-like object or
 * getter) at render time and `Math.ceil` is applied directly, with no effects
 * and no `.value` wrapper (SSR-safe).
 *
 * @see https://vueuse.org/math/useCeil/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const value = { current: 0.95 }
 * const result = useCeil(value) // 1
 *
 * value.current = -7.004 // result === -7 on the next render
 *
 * @param value - The value to ceil.
 * @returns The ceil of the value.
 */
export function useCeil(value: MaybeRefOrGetter<number>): number {
  return Math.ceil(toValue(value))
}
