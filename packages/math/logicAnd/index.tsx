import type { State } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * `AND` condition for values and refs — `true` only when every argument is
 * truthy.
 *
 * Map from @vueuse/math `logicAnd`
 * (`source/vueuse/packages/math/logicAnd/`). Upstream wraps the evaluation in
 * `computed(() => ...)` and returns a `ComputedRef<boolean>`; the reaxuse
 * version is a pure function that resolves every argument (plain values or
 * React refs) with `toValue` and returns a plain `boolean` on each call — there
 * is no reactivity, so re-renders (or effects) drive re-evaluation (SSR-safe).
 *
 * Every argument accepts a React `State<any>` — a plain value, a getter
 * (`() => value`), a React ref (`{ current }`), a `[value, setter]` tuple, or a
 * `{ value, onChange }` pair. Every form is resolved through `toValue`.
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const a = { current: true }
 * const b = { current: false }
 *
 * logicAnd(a, b) // false — re-evaluated on every call
 * logicAnd(true, 1, 'foo') // true
 *
 * @param args - React `State<any>` values to test.
 * @returns `true` when every argument is truthy, `false` otherwise.
 */
export function logicAnd(...args: State<any>[]): boolean {
  return args.every(value => toValue(value))
}
