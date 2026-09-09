/** String keys of `Math` that are methods (callables), mirroring upstream's `UseMathKeys`. */
export type UseMathKeys = keyof { [K in keyof Math as Math[K] extends (...args: any) => any ? K : never]: unknown }

/** Return type — `Math` methods always return a `number`. */
export type UseMathReturn<K extends keyof Math> = ReturnType<Reactified<Math[K]>>

/** Arguments of a plain function. */
type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never

/**
 * The React analog of VueUse's `Reactified<T, Computed>`: same configuration
 * (plain arguments) but the result is the plain return value instead of a
 * `ComputedRef` — the reaxuse hook returns the computed number directly.
 */
type Reactified<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : never

/**
 * React port of VueUse's `useMath`.
 *
 * Map from @vueuse/math `useMath`
 * (`source/vueuse/packages/math/useMath/`). Reactive `Math` methods — pass a
 * `Math` method name as the key and its plain numeric arguments; the result is
 * recomputed on every render and returned directly, with no `.value` wrapper
 * and no effects (SSR-safe).
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * via `reactify` and returns a `ComputedRef<number>`; the reaxuse version is a
 * pure derived hook — `key` and every argument are read at render time and
 * `Math[key]` is invoked immediately, so the returned number always reflects
 * the latest values.
 *
 * React divergence: arguments are plain numbers, not upstream's
 * `MaybeRefOrGetter`. The caller re-renders with new values (e.g. from
 * `useState`).
 *
 * @see https://vueuse.org/math/useMath/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const result = useMath('pow', 2, 3) // 8
 *
 * const power = useMath('pow', 2, 3) // 8
 *
 * const root = useMath('sqrt', 4) // 2
 *
 * const rounded = useMath('round', 2.5) // 3
 *
 * @param key - The `Math` method name to call (e.g. `'pow'`, `'sqrt'`).
 * @param args - Plain numeric arguments to pass to the `Math` method.
 * @returns The result of calling `Math[key]` with the arguments.
 */
export function useMath<K extends keyof Math>(
  key: K,
  ...args: ArgumentsType<Reactified<Math[K]>>
): UseMathReturn<K> {
  const fn = Math[key] as unknown as (...args: number[]) => number
  return fn(...args) as UseMathReturn<K>
}
