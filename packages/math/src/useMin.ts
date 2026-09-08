import type { RefOrValue } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * Composable argument types — a variadic list of resolvable numbers, or a
 * single resolvable array of resolvable numbers. Mirrors VueUse math's
 * `MaybeComputedRefArgs` (`source/vueuse/packages/math/utils.ts`), migrated to
 * `RefOrValue` (plain values or React refs).
 */
type RefOrValueArgs<T> = RefOrValue<T>[] | [RefOrValue<RefOrValue<T>[]>]

/**
 * Flatten the composable arguments into a plain resolved value array.
 * Mirrors VueUse math's `toValueArgsFlat` (`source/vueuse/packages/math/utils.ts`).
 *
 * @__NO_SIDE_EFFECTS__
 */
function toValueArgsFlat<T>(args: RefOrValueArgs<T>): T[] {
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
export function useMin(array: RefOrValue<RefOrValue<number>[]>): number
export function useMin(...args: RefOrValue<number>[]): number

export function useMin(...args: RefOrValueArgs<number>): number {
  return Math.min(...toValueArgsFlat(args))
}
