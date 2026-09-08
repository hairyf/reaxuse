import type { MaybeRefOrGetter } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * `NOT` condition for values, refs and getters — the logical complement of
 * the given value.
 *
 * Map from @vueuse/math `logicNot`
 * (`source/vueuse/packages/math/logicNot/`). Upstream wraps the evaluation in
 * `computed(() => ...)` and returns a `ComputedRef<boolean>`; the reaxuse
 * version is a pure function that resolves the argument (a plain value, a
 * `{ current }` ref-like object or a getter) with `toValue` and returns a
 * plain `boolean` on each call — there is no reactivity, so re-renders (or
 * effects) drive re-evaluation (SSR-safe).
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const a = { current: true }
 *
 * logicNot(a) // false — re-evaluated on every call
 * logicNot(() => a.current) // false
 * logicNot('foo') // false
 *
 * @param v - A value, `{ current }` ref-like object or getter to negate.
 * @returns `true` when the resolved value is falsy, `false` otherwise.
 */
export function logicNot(v: MaybeRefOrGetter<any>): boolean {
  return !toValue(v)
}
