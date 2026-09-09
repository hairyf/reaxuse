import type { State } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * `NOT` condition for values and refs — the logical complement of the given
 * value.
 *
 * Map from @vueuse/math `logicNot`
 * (`source/vueuse/packages/math/logicNot/`). Upstream wraps the evaluation in
 * `computed(() => ...)` and returns a `ComputedRef<boolean>`; the reaxuse
 * version is a pure function that resolves the argument (a plain value or a
 * React ref) with `toValue` and returns a plain `boolean` on each call — there
 * is no reactivity, so re-renders (or effects) drive re-evaluation (SSR-safe).
 *
 * `v` accepts a React `State<any>` — a plain value, a getter (`() => value`),
 * a React ref (`{ current }`), a `[value, setter]` tuple, or a
 * `{ value, onChange }` pair. Every form is resolved through `toValue`.
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const a = { current: true }
 *
 * logicNot(a) // false — re-evaluated on every call
 * logicNot(0) // true
 * logicNot('foo') // false
 *
 * @param v - A React `State<any>` value to negate.
 * @returns `true` when the resolved value is falsy, `false` otherwise.
 */
export function logicNot(v: State<any>): boolean {
  return !toValue(v)
}
