---
category: '@Math'
---

# useAverage

Get the average of an array reactively — React port of VueUse's
[`useAverage`](https://vueuse.org/math/useAverage/).

**Mapping:** `ComputedRef<number>` → pure derived hook returning a plain
`number`. Values are resolved at render time (plain numbers, `{ current }`
ref-like objects or getters) and the average is computed directly — no effects,
no `.value` wrapper (SSR-safe). An empty input yields `0`.

## Usage

```tsx
import { useAverage } from '@reaxuse/math'

const array = [1, 2, 3]
const averageValue = useAverage(array) // 2
```

```tsx
import { useAverage } from '@reaxuse/math'

const [a, setA] = useState(1)
const [b, setB] = useState(3)

const averageValue = useAverage(a, b) // 2
```

<DemoContainer name="UseAverage" />

## Type Declarations

```ts
export function useAverage(array: MaybeRefOrGetter<MaybeRefOrGetter<number>[]>): number
export function useAverage(...args: MaybeRefOrGetter<number>[]): number
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/math/useAverage/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useAverage/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useAverage/index.test.ts) (mirrored in `useAverage.test.tsx`)
- reaxuse: [`packages/math/src/useAverage.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/useAverage.ts), docs + demo co-located in `packages/math/useAverage/`

<Contributors name="useAverage" />
