import type { State } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * Composable argument types — a variadic list of `State<number>` values, or a
 * single `ArraySource<number>` array. Mirrors VueUse math's
 * `MaybeComputedRefArgs` (`source/vueuse/packages/math/utils.ts`), migrated to
 * `State` (plain values, getters, React refs, `[value, setter]` tuples and
 * `{ value, onChange }` pairs).
 */
type StateArgs<T> = State<T>[] | [ArraySource<T>]

/**
 * Array-valued source type. `State<State<T>[]>` alone is not assignable from a
 * plain `useState<T[]>()` tuple because the tuple setter is contravariant, so
 * the plain-array form is accepted as a separate union member.
 */
type ArraySource<T> = State<State<T>[]> | State<T[]>

/**
 * Flatten the composable arguments into a plain resolved value array.
 * Mirrors VueUse math's `toValueArgsFlat` (`source/vueuse/packages/math/utils.ts`).
 *
 * @__NO_SIDE_EFFECTS__
 */
function toValueArgsFlat<T>(args: StateArgs<T>): T[] {
  return args.flatMap((item: any): T[] => {
    const value = toValue(item)
    if (Array.isArray(value))
      return value.map((inner: any) => toValue(inner))
    return [value]
  })
}

/**
 * React port of VueUse's `useMin`.
 *
 * Map from @vueuse/math `useMin`
 * (`source/vueuse/packages/math/useMin/`). Reactively calculate the minimum of
 * the given numbers — the React analog of reactive `Math.min`.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reaxuse version is a pure derived
 * hook — arguments (plain values or React refs) are resolved and flattened at
 * render time and the minimum is returned
 * directly, with no effects and no `.value` wrapper (SSR-safe).
 *
 * Every argument accepts a React `State<number>` — a plain number, a getter
 * (`() => value`), a React ref (`{ current }`), a `[value, setter]` tuple, or a
 * `{ value, onChange }` pair — and the single-array form accepts
 * `ArraySource<number>`. Every form is resolved through `toValue`.
 *
 * Caveat: a 2-element array whose second element is a function resolves as the
 * `[value, setter]` tuple form (see `toValue`), so `useMin([5, () => 1])` reads
 * `5`, not `1`. Pass the elements as separate arguments
 * (`useMin(5, () => 1)`) to compare them.
 *
 * @see https://vueuse.org/math/useMin/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const array = [1, 2, 3, 4]
 * const min = useMin(array) // 1
 *
 * const value1 = { current: 1 }
 * const value2 = { current: 3 }
 * const min = useMin(value1, value2, 2) // 1
 *
 * @param array - A set of numbers to find the minimum of.
 * @returns The minimum of the given numbers, or `Number.POSITIVE_INFINITY` when
 * no arguments are passed (matching `Math.min()` semantics).
 */
export function useMin(array: ArraySource<number>): number
export function useMin(...args: State<number>[]): number

export function useMin(...args: StateArgs<number>): number {
  return Math.min(...toValueArgsFlat(args))
}
