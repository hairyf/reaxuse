---
category: '@Math'
---

# usePrecision

Reactively set the precision of a number — React port of VueUse's
[`usePrecision`](https://vueuse.org/math/usePrecision/).

**Mapping:** `ComputedRef<number>` → pure derived hook. `value`, `digits` and
`options` are resolved at render time (plain values, `{ current }` ref-like
objects or getters) and the precision-adjusted number is memoized and returned
directly — no effects, no `.value` wrapper (SSR-safe).

## Usage

```tsx
import { usePrecision } from '@reaxuse/math'

const value = { current: 3.1415 }
const result = usePrecision(value, 2) // 3.14

const ceilResult = usePrecision(value, 2, {
  math: 'ceil'
}) // 3.15

const floorResult = usePrecision(value, 3, {
  math: 'floor'
}) // 3.141
```

<DemoContainer name="UsePrecision" />

## Type Declarations

```ts
export interface UsePrecisionOptions {
  /**
   * Method to use for rounding.
   *
   * @default 'round'
   */
  math?: 'floor' | 'ceil' | 'round' | 'trunc'
}

export function usePrecision(
  value: MaybeRefOrGetter<number>,
  digits: MaybeRefOrGetter<number>,
  options?: MaybeRefOrGetter<UsePrecisionOptions>,
): number
```

## Source

- VueUse: [`packages/math/usePrecision`](https://github.com/vueuse/vueuse/tree/main/packages/math/usePrecision)
- VueUse source: [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/usePrecision/index.ts)
- VueUse tests: [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/usePrecision/index.test.ts)
- reaxuse: [`packages/math/src/usePrecision.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/usePrecision.ts)

<Contributors name="usePrecision" />
