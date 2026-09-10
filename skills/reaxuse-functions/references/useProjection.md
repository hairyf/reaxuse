---
category: '@Math'
---

# useProjection

Reactive numeric projection from one domain to another

## Usage

```tsx
import { useProjection } from '@reaxuse/math'
import { useState } from 'react'

const [input, setInput] = useState(0)
const projected = useProjection(input, [0, 10], [0, 100])

setInput(5) // projected === 50 on the next render
setInput(10) // projected === 100 on the next render
```

`input`, `fromDomain` and `toDomain` are plain read-only values (upstream takes `MaybeRefOrGetter<...>`).
Re-render with new values — e.g. from `useState` — and the hook recomputes:

```tsx
import { useProjection } from '@reaxuse/math'
import { useState } from 'react'

const [from, setFrom] = useState<readonly [number, number]>([0, 10])
const projected = useProjection(5, from, [0, 100])

setFrom([0, 20]) // triggers a re-render
```

## Type Declarations

```ts
/**
 * Projection function type — `ProjectorFunction<F, T>` maps an input from the
 * source domain to the target domain.
 */
export type ProjectorFunction<F, T> = (
  input: F,
  from: readonly [F, F],
  to: readonly [T, T],
) => T
/**
 * React port of VueUse's `useProjection`.
 *
 * Map from @vueuse/math `useProjection`
 * Mapping: `ComputedRef<number>` → plain number recomputed from the current
 * value on every render; pure derived value — no reactive `.value`, the caller
 * drives re-renders.
 *
 * React divergence: `input`, `fromDomain` and `toDomain` are all plain
 * read-only values, not upstream's `MaybeRefOrGetter<...>`. In particular the
 * getter form (`() => number`) is NOT accepted — getters as data sources are
 * rejected repo-wide (issue #462). The caller re-renders with new values (e.g.
 * from `useState`) and the hook recomputes. Like upstream, the projection is
 * delegated to `createProjection` (its default projector is the linear numeric
 * projector), so the projector function is not duplicated here.
 *
 * @param input - The input value to project.
 * @param fromDomain - The source domain (a plain `readonly [number, number]`).
 * @param toDomain - The target domain (a plain `readonly [number, number]`).
 * @param projector - The projector function (defaults to the linear numeric projector).
 * @returns The projected number.
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const projected = useProjection(5, [0, 10], [0, 100]) // 50
 */
export declare function useProjection(
  input: number,
  fromDomain: readonly [number, number],
  toDomain: readonly [number, number],
  projector?: ProjectorFunction<number, number>,
): number
```
