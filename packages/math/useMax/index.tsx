import type { State } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * Array-valued source type. `State<State<T>[]>` alone is not assignable from a
 * plain `useState<T[]>()` tuple because the tuple setter is contravariant, so
 * the plain-array form is accepted as a separate union member.
 */
type ArraySource<T> = State<State<T>[]> | State<T[]>

type StateArgs<T> = State<T>[] | [ArraySource<T>]

function toValueArgsFlat<T>(args: StateArgs<T>): T[] {
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
 * hook — the values (plain numbers or React refs) are resolved at render time
 * and the maximum is returned directly as a `number`, with no `.value` wrapper
 * (SSR-safe).
 *
 * Every argument accepts a React `State<number>` — a plain number, a getter
 * (`() => value`), a React ref (`{ current }`), a `[value, setter]` tuple, or a
 * `{ value, onChange }` pair — and the single-array form accepts
 * `ArraySource<number>`. Every form is resolved through `toValue`.
 *
 * Caveat: a 2-element array whose second element is a function resolves as the
 * `[value, setter]` tuple form (see `toValue`), so `useMax([1, () => 2])` reads
 * `1`, not `2`. Pass the elements as separate arguments
 * (`useMax(1, () => 2)`) to compare them.
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
 * @param array - An array of numbers, each a React `State<number>`.
 * @returns The maximum of the given values (`Number.NEGATIVE_INFINITY` when
 * called with no arguments).
 */
export function useMax(array: ArraySource<number>): number
export function useMax(...args: State<number>[]): number
export function useMax(...args: StateArgs<number>): number {
  const array = toValueArgsFlat(args)
  return Math.max(...array)
}
