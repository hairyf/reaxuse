import type { RefOrValue, State } from '@reaxuse/shared'
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
 * value on every render; accepts a React ref or a plain value.
 * Pure derived value — no reactive `.value`, the caller drives re-renders.
 *
 * `input` accepts a React `State<number>` — a plain number, a getter
 * (`() => input`), a React ref (`{ current }`), a `[value, setter]` tuple, or a
 * `{ value, onChange }` pair.
 *
 * `fromDomain` and `toDomain` deliberately stay `RefOrValue<readonly [number, number]>`
 * (plain tuple or React ref): their value *is* a 2-element array, which
 * collides with the `State<T>` `[value, setter]` tuple form and would make the
 * domain ambiguous with a controlled state pair.
 *
 * @param input - The input value to project (a React `State<number>`).
 * @param fromDomain - The source domain (plain `readonly [number, number]` or React ref).
 * @param toDomain - The target domain (plain `readonly [number, number]` or React ref).
 * @param projector - The projector function (defaults to the linear numeric projector).
 * @returns The projected number.
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const input = useRef(5)
 * const projected = useProjection(input, [0, 10], [0, 100]) // 50
 */
export function useProjection(
  input: State<number>,
  fromDomain: RefOrValue<readonly [number, number]>,
  toDomain: RefOrValue<readonly [number, number]>,
  projector: ProjectorFunction<number, number> = defaultNumericProjector,
): number {
  return projector(toValue(input), toValue(fromDomain), toValue(toDomain))
}
