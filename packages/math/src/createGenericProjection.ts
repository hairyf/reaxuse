import type { RefOrValue } from '@reaxuse/shared'
import type { ProjectorFunction } from './useProjection'
import { toValue } from '@reaxuse/shared'

/**
 * A projector built by `createGenericProjection`: takes the input value (a plain
 * value or a React ref) and returns the projected value of type `T`.
 */
export type UseProjection<F, T> = (input: RefOrValue<F>) => T

/**
 * React port of VueUse's `createGenericProjection`.
 *
 * Map from @vueuse/math `createGenericProjection`
 * Mapping: `ComputedRef<T>` → a plain projector function returning `T`. React
 * has no reactive graph, so the returned projector recomputes the projection on
 * every call (nothing is memoized) and the caller drives re-renders. Zero-argument
 * getters are not supported — `RefOrValue<T> = T | Ref<T>`; pass a React ref when
 * the value must be read lazily.
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const projector = createGenericProjection(
 *   [0, 10],
 *   ['low', 'high'],
 *   (input, from, to) => (input > (from[0] + from[1]) / 2 ? to[1] : to[0]),
 * )
 * projector(8) // 'high'
 */
export function createGenericProjection<F = number, T = number>(
  fromDomain: RefOrValue<readonly [F, F]>,
  toDomain: RefOrValue<readonly [T, T]>,
  projector: ProjectorFunction<F, T>,
): UseProjection<F, T> {
  return (input: RefOrValue<F>) => projector(toValue(input), toValue(fromDomain), toValue(toDomain))
}
