import type { State } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/** String keys of `Math` that are methods (callables), mirroring upstream's `UseMathKeys`. */
export type UseMathKeys = keyof { [K in keyof Math as Math[K] extends (...args: any) => any ? K : never]: unknown }

/** Return type — `Math` methods always return a `number`. */
export type UseMathReturn<K extends keyof Math> = ReturnType<Reactified<Math[K]>>

/** Arguments of a plain function where each argument may also be a `State`. */
type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never

/**
 * The React analog of VueUse's `Reactified<T, Computed>`: same configuration
 * (arguments become `State`) but the result is the plain return
 * value instead of a `ComputedRef` — the reaxuse hook resolves arguments at
 * render time and returns the computed number directly.
 */
type Reactified<T> = T extends (...args: infer A) => infer R
  ? (...args: { [K in keyof A]: State<A[K]> }) => R
  : never

/**
 * React port of VueUse's `useMath`.
 *
 * Map from @vueuse/math `useMath`
 * (`source/vueuse/packages/math/useMath/`). Reactive `Math` methods — pass a
 * `Math` method name as the key and its arguments (plain values or React
 * refs); the result is recomputed on every render and
 * returned directly, with no `.value` wrapper and no effects (SSR-safe).
 *
 * Every argument accepts a React `State<number>` — a plain number, a getter
 * (`() => value`), a React ref (`{ current }`), a `[value, setter]` tuple, or a
 * `{ value, onChange }` pair. Every form is resolved through `toValue`.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * via `reactify` and returns a `ComputedRef<number>`; the reaxuse version is a
 * pure derived hook — `key` and every argument are resolved at render time and
 * `Math[key]` is invoked immediately, so the returned number always reflects
 * the latest values.
 *
 * @see https://vueuse.org/math/useMath/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const result = useMath('pow', 2, 3) // 8
 *
 * const base = { current: 2 }
 * const exponent = { current: 3 }
 * const power = useMath('pow', base, exponent) // 8
 *
 * const num = { current: 4 }
 * const root = useMath('sqrt', num) // 2
 *
 * const rounded = useMath('round', { current: 2.5 }) // 3
 *
 * @param key - The `Math` method name to call (e.g. `'pow'`, `'sqrt'`).
 * @param args - Arguments to pass to the `Math` method — React `State<number>`
 *   values, resolved at render time.
 * @returns The result of calling `Math[key]` with the (resolved) arguments.
 */
export function useMath<K extends keyof Math>(
  key: K,
  ...args: ArgumentsType<Reactified<Math[K]>>
): UseMathReturn<K> {
  const fn = Math[key] as unknown as (...args: number[]) => number
  return fn(...args.map(arg => toValue(arg as State<number>))) as UseMathReturn<K>
}
