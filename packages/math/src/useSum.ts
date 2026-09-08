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
 * React port of VueUse's `useSum`.
 *
 * Map from @vueuse/math `useSum`
 * (`source/vueuse/packages/math/useSum/`). Reactively get the sum of values.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reaxuse version is a pure derived
 * hook — the values (plain numbers, `{ current }` ref-like objects or getters)
 * are resolved at render time and the sum is returned directly as a `number`,
 * with no `.value` wrapper (SSR-safe).
 *
 * @see https://vueuse.org/math/useSum/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const array = [1, 2, 3, 4]
 * const sum = useSum(array) // 10
 *
 * const [a, setA] = useState(1)
 * const [b, setB] = useState(3)
 * const sum2 = useSum(a, b, 2) // 6
 *
 * @param array - An array of numbers, each either a plain number, a ref-like
 * `{ current }` object or a getter function.
 * @returns The sum of the given numbers (`0` when called with no arguments).
 */
export function useSum(array: MaybeRefOrGetter<MaybeRefOrGetter<number>[]>): number
export function useSum(...args: MaybeRefOrGetter<number>[]): number
export function useSum(...args: MaybeComputedRefArgs<number>): number {
  const array = toValueArgsFlat(args)
  return array.reduce((sum, v) => sum + v, 0)
}
