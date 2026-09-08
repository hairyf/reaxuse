---
category: '@Math'
---

# createProjection

Reactive numeric projection from one domain to another — React port of VueUse's
[`createProjection`](https://vueuse.org/math/createProjection/).

**Mapping:** `ComputedRef<number>` → a plain projector function returning a plain
`number`. React has no reactive graph, so the returned projector recomputes the
projection on every call and the caller drives re-renders; the domains accept a
React ref or a plain value. Delegates to `createGenericProjection` with the
default numeric projector.

## Usage

```tsx
import { createProjection } from '@reaxuse/math'

const useProjector = createProjection([0, 10], [0, 100])
const input = { current: 0 }
const projected = useProjector(input) // 0

input.current = 5 // projected === 50 on the next render
input.current = 10 // projected === 100 on the next render
```

<DemoContainer name="CreateProjection" />

## Type Declarations

```ts
export function createProjection(
  fromDomain: RefOrValue<readonly [number, number]>,
  toDomain: RefOrValue<readonly [number, number]>,
  projector?: ProjectorFunction<number, number>,
): UseProjection<number, number>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/math/createProjection/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/createProjection/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/createProjection/index.test.ts) (mirrored in `createProjection.test.tsx`)
- reaxuse: [`packages/math/src/createProjection.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/createProjection.ts), docs + demo co-located in `packages/math/createProjection/`
