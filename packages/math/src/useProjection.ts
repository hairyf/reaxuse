import type { MaybeRefOrGetter } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'

/**
 * Projection function type — `ProjectorFunction<F, T>` maps an input from the
 * source domain to the target domain.
 */
export type ProjectorFunction<F, T> = (input: F, from: readonly [F, F], to: readonly [T, T]) => T

function defaultNumericProjector(input: number, from: readonly [number, number], to: readonly [number, number]) {
  return (input - from[0]) / (from[1] - from[0]) * (to[1] - to[0]) + to[0]
}

/**
 * React port of VueUse's `useProjection`.
 *
 * Map from @vueuse/math `useProjection`
 * Mapping: `ComputedRef<number>` → plain number recomputed from the current
 * value on every render; accepts a ref-like `{ current }` object or getter.
 * Pure derived value — no reactive `.value`, the caller drives re-renders.
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const input = { current: 5 }
 * const projected = useProjection(input, [0, 10], [0, 100]) // 50
 */
export function useProjection(
  input: MaybeRefOrGetter<number>,
  fromDomain: MaybeRefOrGetter<readonly [number, number]>,
  toDomain: MaybeRefOrGetter<readonly [number, number]>,
  projector: ProjectorFunction<number, number> = defaultNumericProjector,
): number {
  return projector(toValue(input), toValue(fromDomain), toValue(toDomain))
}
