---
category: '@Math'
related: useProjection, createGenericProjection
---

# createProjection

Reactive numeric projection from one domain to another.

## Usage

```tsx
import { createProjection } from '@reaxuse/math'
import { useState } from 'react'

const useProjector = createProjection([0, 10], [0, 100])
const [input, setInput] = useState(0)
const projected = useProjector(input) // 0

setInput(5) // projected === 50 on the next render
setInput(10) // projected === 100 on the next render
```

## Type Declarations

```ts
/**
 * React port of VueUse's `createProjection`.
 *
 * Map from @vueuse/math `createProjection`
 * Mapping: `ComputedRef<number>` → a plain projector function returning a plain
 * `number`. React has no reactive graph, so the returned projector recomputes
 * the numeric projection on every call and the caller drives re-renders; the
 * domains are plain values (`MaybeRefOrGetter` is not supported) — re-create the
 * projector when a domain changes. Delegates to `createGenericProjection` with
 * the default numeric projector.
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const projector = createProjection([0, 10], [0, 100])
 * projector(5) // 50
 */
export declare function createProjection(
  fromDomain: readonly [number, number],
  toDomain: readonly [number, number],
  projector?: ProjectorFunction<number, number>,
): UseProjection<number, number>
```
