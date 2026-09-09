import type { State } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * React port of VueUse's `useAbs`.
 *
 * Map from @vueuse/math `useAbs`
 * (`source/vueuse/packages/math/useAbs/`). Reactive `Math.abs`.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reaxuse version is a pure derived
 * hook — the value is resolved (a plain number or a React ref) at render time
 * and `Math.abs` is applied directly, with no effects
 * and no `.value` wrapper (SSR-safe).
 *
 * `value` accepts a React `State<number>` — a plain number, a getter
 * (`() => value`), a React ref (`{ current }`), a `[value, setter]` tuple, or a
 * `{ value, onChange }` pair. Every form is resolved through `toValue`; the
 * tuple and `{ value, onChange }` forms are the React state protocol and have
 * no upstream equivalent (upstream takes `MaybeRefOrGetter<number>`).
 *
 * @see https://vueuse.org/math/useAbs/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const value = { current: -23 }
 * const result = useAbs(value) // 23
 *
 * value.current = 23 // result === 23 on the next render
 *
 * @param value - The value to compute the absolute value of.
 * @returns The absolute value of the value.
 */
export function useAbs(value: State<number>): number {
  return Math.abs(toValue(value))
}
