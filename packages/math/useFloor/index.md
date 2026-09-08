---
category: '@Math'
---

# useFloor

Reactive `Math.floor` — React port of VueUse's
[`useFloor`](https://vueuse.org/math/useFloor/).

**Mapping:** `ComputedRef<number>` → plain number recomputed on every render
(pure derived value, no reactive `.value`); input accepts a ref-like
`{ current }` object or a getter.

## Usage

```tsx
import { useFloor } from '@reaxuse/math'

const value = { current: 45.95 }
const result = useFloor(value) // 45

value.current = -45.05 // result === -46 on the next render
```

<DemoContainer name="UseFloor" />

## Type Declarations

```ts
export function useFloor(value: MaybeRefOrGetter<number>): number
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/math/useFloor/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useFloor/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useFloor/index.test.ts) (mirrored in `useFloor.test.tsx`)
- reaxuse: [`packages/math/src/useFloor.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/useFloor.ts), docs + demo co-located in `packages/math/useFloor/`

<Contributors name="useFloor" />
