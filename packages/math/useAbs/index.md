---
category: '@Math'
---

# useAbs

Reactive `Math.abs` — React port of VueUse's
[`useAbs`](https://vueuse.org/math/useAbs/).

**Mapping:** `ComputedRef<number>` → plain number recomputed on every render
(pure derived value, no reactive `.value`); input accepts a plain number or
a React ref.

## Usage

```tsx
import { useAbs } from '@reaxuse/math'

const value = { current: -23 }
const result = useAbs(value) // 23

value.current = 23 // result === 23 on the next render
```

<DemoContainer name="UseAbs" />

## Type Declarations

```ts
export function useAbs(value: RefOrValue<number>): number
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/math/useAbs/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useAbs/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useAbs/index.test.ts) (mirrored in `useAbs.test.tsx`)
- reaxuse: [`packages/math/src/useAbs.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/useAbs.ts), docs + demo co-located in `packages/math/useAbs/`

<Contributors name="useAbs" />
