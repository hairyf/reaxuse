import type { MaybeRefOrGetter } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

type MaybeComputedRefArgs<T> = MaybeRefOrGetter<T>[] | [MaybeRefOrGetter<MaybeRefOrGetter<T>[]>]

function toValueArgsFlat<T>(args: MaybeComputedRefArgs<T>): T[] {
  return args
    .flatMap((i: any) => {
      const v = toValue(i)
      if (Array.isArray(v))
        return v.map(i => toValue(i))
      return [v]
    })
}

/**
 * React port of VueUse's `useMax`.
 *
 * Map from @vueuse/math `useMax`
 * (`source/vueuse/packages/math/useMax/`). Reactively get maximum of values.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reaxuse version is a pure derived
 * hook — the values (plain numbers, `{ current }` ref-like objects or getters)
 * are resolved at render time and the maximum is returned directly as a
 * `number`, with no `.value` wrapper (SSR-safe).
 *
 * @see https://vueuse.org/math/useMax/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const array = [1, 2, 3, 4]
 * const max = useMax(array) // 4
 *
 * const [a, setA] = useState(1)
 * const [b, setB] = useState(3)
 * const max2 = useMax(a, b, 2) // 3
 *
 * @param array - An array of values, each either a plain number, a ref-like
 * `{ current }` object or a getter function.
 * @returns The maximum of the given values (`Number.NEGATIVE_INFINITY` when
 * called with no arguments).
 */
export function useMax(array: MaybeRefOrGetter<MaybeRefOrGetter<number>[]>): number
export function useMax(...args: MaybeRefOrGetter<number>[]): number
export function useMax(...args: MaybeComputedRefArgs<number>): number {
  const array = toValueArgsFlat(args)
  return Math.max(...array)
}
