---
category: '@Math'
---

# createGenericProjection

Generic version of `createProjection` — accepts a custom projector function to map
arbitrary types of domains. React port of VueUse's
[`createGenericProjection`](https://vueuse.org/math/createGenericProjection/).

**Mapping:** `ComputedRef<T>` → a plain projector function returning a plain `T`.
React has no reactive graph, so the returned projector recomputes the projection
on every call and the caller drives re-renders; the domains accept a React ref or
a plain value. Zero-argument getters are not supported
(`RefOrValue<T> = T | Ref<T>`).

## Usage

```tsx
import { createGenericProjection } from '@reaxuse/math'

const useProjector = createGenericProjection(
  [0, 10],
  ['low', 'high'],
  (input, from, to) => (input > (from[0] + from[1]) / 2 ? to[1] : to[0]),
)

const input = { current: 3 }
const projected = useProjector(input) // 'low'

input.current = 8 // projected === 'high' on the next render
```

<DemoContainer name="CreateGenericProjection" />

## Type Declarations

```ts
export type UseProjection<F, T> = (input: RefOrValue<F>) => T

export function createGenericProjection<F = number, T = number>(
  fromDomain: RefOrValue<readonly [F, F]>,
  toDomain: RefOrValue<readonly [T, T]>,
  projector: ProjectorFunction<F, T>,
): UseProjection<F, T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/math/createGenericProjection/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/createGenericProjection/index.ts) (implementation; upstream ships no test file, so `createGenericProjection.test.tsx` covers the documented behaviour)
- reaxuse: [`packages/math/src/createGenericProjection.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/createGenericProjection.ts), docs + demo co-located in `packages/math/createGenericProjection/`
