import type { RefOrValue } from '@reaxuse/shared'
import type { UseProjection } from './createGenericProjection'
import type { ProjectorFunction } from './useProjection'
import { createGenericProjection } from './createGenericProjection'

function defaultNumericProjector(input: number, from: readonly [number, number], to: readonly [number, number]) {
  return (input - from[0]) / (from[1] - from[0]) * (to[1] - to[0]) + to[0]
}

/**
 * React port of VueUse's `createProjection`.
 *
 * Map from @vueuse/math `createProjection`
 * Mapping: `ComputedRef<number>` → a plain projector function returning `number`.
 * React has no reactive graph, so the returned projector recomputes the numeric
 * projection on every call and the caller drives re-renders; the domains accept a
 * React ref or a plain value (`RefOrValue<T> = T | Ref<T>`, getters are not
 * supported). Delegates to `createGenericProjection` with the default numeric
 * projector.
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const projector = createProjection([0, 10], [0, 100])
 * projector(5) // 50
 */
export function createProjection(
  fromDomain: RefOrValue<readonly [number, number]>,
  toDomain: RefOrValue<readonly [number, number]>,
  projector: ProjectorFunction<number, number> = defaultNumericProjector,
): UseProjection<number, number> {
  return createGenericProjection(fromDomain, toDomain, projector)
}
