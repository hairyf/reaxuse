import type { State } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * React port of VueUse's `useFloor`.
 *
 * Map from @vueuse/math `useFloor`
 * (`source/vueuse/packages/math/useFloor/`). Reactive `Math.floor`.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reaxuse version is a pure derived
 * hook — the value is resolved (a plain number or a React ref) at render time
 * and `Math.floor` is applied directly, with no
 * effects and no `.value` wrapper (SSR-safe).
 *
 * `value` accepts a React `State<number>` — a plain number, a getter
 * (`() => value`), a React ref (`{ current }`), a `[value, setter]` tuple, or a
 * `{ value, onChange }` pair. Every form is resolved through `toValue`; the
 * tuple and `{ value, onChange }` forms are the React state protocol and have
 * no upstream equivalent (upstream takes `MaybeRefOrGetter<number>`).
 *
 * @see https://vueuse.org/math/useFloor/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const value = { current: 45.95 }
 * const result = useFloor(value) // 45
 *
 * value.current = -45.05 // result === -46 on the next render
 *
 * @param value - The value to floor.
 * @returns The floor of the value.
 */
export function useFloor(value: State<number>): number {
  return Math.floor(toValue(value))
}
