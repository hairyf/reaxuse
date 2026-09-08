import type { MaybeRefOrGetter } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * React port of VueUse's `useRound`.
 *
 * Map from @vueuse/math `useRound`
 * (`source/vueuse/packages/math/useRound/`). Reactive `Math.round`.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reaxuse version is a pure derived
 * hook — the value is resolved (plain number, `{ current }` ref-like object or
 * getter) at render time and `Math.round` is applied directly, with no
 * effects and no `.value` wrapper (SSR-safe).
 *
 * @see https://vueuse.org/math/useRound/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const value = { current: 20.49 }
 * const result = useRound(value) // 20
 *
 * value.current = -20.51 // result === -21 on the next render
 *
 * @param value - The value to round.
 * @returns The value rounded to the nearest integer.
 */
export function useRound(value: MaybeRefOrGetter<number>): number {
  return Math.round(toValue(value))
}
