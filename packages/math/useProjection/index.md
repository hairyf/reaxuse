---
category: '@Math'
---

# useProjection

Reactive numeric projection from one domain to another — React port of VueUse's
[`useProjection`](https://vueuse.org/math/useProjection/).

**Mapping:** `ComputedRef<number>` → plain number recomputed on every render
(pure derived value, no reactive `.value`); input accepts a ref-like
`{ current }` object or a getter.

## Usage

```tsx
import { useProjection } from '@reaxuse/math'

const input = { current: 0 }
const projected = useProjection(input, [0, 10], [0, 100])

input.current = 5 // projected === 50 on the next render
input.current = 10 // projected === 100 on the next render
```

<DemoContainer name="UseProjection" />

## Type Declarations

```ts
export function useProjection(
  input: MaybeRefOrGetter<number>,
  fromDomain: MaybeRefOrGetter<readonly [number, number]>,
  toDomain: MaybeRefOrGetter<readonly [number, number]>,
  projector?: ProjectorFunction<number, number>,
): number
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/math/useProjection/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useProjection/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useProjection/index.test.ts) (mirrored in `useProjection.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/math/useProjection/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/math/src/useProjection.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/useProjection.ts), docs + demo co-located in `packages/math/useProjection/`

<Contributors name="useProjection" />
