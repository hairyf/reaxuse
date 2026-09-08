import type { RefOrValue } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

type RefOrValueArgs<T> = RefOrValue<T>[] | [RefOrValue<RefOrValue<T>[]>]

function toValueArgsFlat<T>(args: RefOrValueArgs<T>): T[] {
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
 * hook — the values (plain numbers or React refs) are resolved at render time
 * and the sum is returned directly as a `number`,
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
 * @param array - An array of numbers, each either a plain number or a React
 * ref.
 * @returns The sum of the given numbers (`0` when called with no arguments).
 */
export function useSum(array: RefOrValue<RefOrValue<number>[]>): number
export function useSum(...args: RefOrValue<number>[]): number
export function useSum(...args: RefOrValueArgs<number>): number {
  const array = toValueArgsFlat(args)
  return array.reduce((sum, v) => sum + v, 0)
}
