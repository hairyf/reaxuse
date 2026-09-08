---
category: '@Math'
---

# useSum

Get the sum of an array reactively — React port of VueUse's
[`useSum`](https://vueuse.org/math/useSum/).

**Mapping:** `ComputedRef<number>` → pure derived hook returning a plain
`number`. Values are resolved at render time (plain numbers, `{ current }`
ref-like objects or getters) and the sum is computed directly — no effects,
no `.value` wrapper (SSR-safe).

## Usage

```tsx
import { useSum } from '@reaxuse/math'

const array = [1, 2, 3, 4]
const sum = useSum(array) // 10
```

```tsx
import { useSum } from '@reaxuse/math'

const [a, setA] = useState(1)
const [b, setB] = useState(3)

const sum = useSum(a, b, 2) // 6
```

<DemoContainer name="UseSum" />

## Type Declarations

```ts
export function useSum(array: MaybeRefOrGetter<MaybeRefOrGetter<number>[]>): number
export function useSum(...args: MaybeRefOrGetter<number>[]): number
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/math/useSum/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useSum/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useSum/index.test.ts) (mirrored in `useSum.test.tsx`)
- reaxuse: [`packages/math/src/useSum.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/useSum.ts), docs + demo co-located in `packages/math/useSum/`

<Contributors name="useSum" />
