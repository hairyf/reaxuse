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
 * React port of VueUse's `useAverage`.
 *
 * Map from @vueuse/math `useAverage`
 * (`source/vueuse/packages/math/useAverage/`). Reactively get the average of values.
 *
 * Adjustment for React: upstream wraps the computation in `computed(() => ...)`
 * and returns a `ComputedRef<number>`; the reaxuse version is a pure derived
 * hook — the values (plain numbers, `{ current }` ref-like objects or getters)
 * are resolved at render time and the average is returned directly as a `number`,
 * with no `.value` wrapper (SSR-safe).
 *
 * @see https://vueuse.org/math/useAverage/
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const array = [1, 2, 3, 4]
 * const average = useAverage(array) // 2.5
 *
 * const [a, setA] = useState(1)
 * const [b, setB] = useState(3)
 * const average2 = useAverage(a, b, 2) // 2
 *
 * @param array - An array of numbers, each either a plain number, a ref-like
 * `{ current }` object or a getter function.
 * @returns The average of the given numbers (`0` when called with no arguments).
 */
export function useAverage(array: MaybeRefOrGetter<MaybeRefOrGetter<number>[]>): number
export function useAverage(...args: MaybeRefOrGetter<number>[]): number
export function useAverage(...args: MaybeComputedRefArgs<number>): number {
  const array = toValueArgsFlat(args)
  return array.length === 0 ? 0 : array.reduce((sum, v) => sum + v, 0) / array.length
}
