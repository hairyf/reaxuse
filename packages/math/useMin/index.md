---
category: '@Math'
---

# useMin

Reactive `Math.min` — React port of VueUse's
[`useMin`](https://vueuse.org/math/useMin/).

**Mapping:** `ComputedRef<number>` → pure derived hook. Arguments (plain values
or React refs) are resolved and flattened at render
time and the minimum is returned directly — no effects, no `.value` wrapper
(SSR-safe).

## Usage

```tsx
import { useMin } from '@reaxuse/math'

const array = { current: [1, 2, 3, 4] }
const min = useMin(array) // 1
```

```tsx
import { useMin } from '@reaxuse/math'

const a = { current: 1 }
const b = { current: 3 }

const min = useMin(a, b, 2) // 1
```

<DemoContainer name="UseMin" />

## Type Declarations

```ts
export function useMin(array: RefOrValue<RefOrValue<number>[]>): number
export function useMin(...args: RefOrValue<number>[]): number
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/math/useMin/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useMin/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useMin/index.test.ts) (mirrored in `useMin.test.tsx`)
- reaxuse: [`packages/math/src/useMin.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/useMin.ts), docs + demo co-located in `packages/math/useMin/`

<Contributors name="useMin" />
