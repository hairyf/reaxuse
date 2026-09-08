---
category: '@Math'
---

# useTrunc

Reactive `Math.trunc` — React port of VueUse's
[`useTrunc`](https://vueuse.org/math/useTrunc/).

**Mapping:** `ComputedRef<number>` → pure derived hook. `value` is resolved at
render time (plain number, `{ current }` ref-like object or getter) and the
truncated number is returned directly — no effects, no `.value` wrapper
(SSR-safe).

## Usage

```tsx
import { useTrunc } from '@reaxuse/math'

const value = { current: 0.95 }
const result1 = useTrunc(value) // 0

value.current = -2.34
const result2 = useTrunc(value) // -2
```

<DemoContainer name="UseTrunc" />

## Type Declarations

```ts
export function useTrunc(
  value: MaybeRefOrGetter<number>,
): number
```

## Source

- VueUse: [`packages/math/useTrunc`](https://github.com/vueuse/vueuse/tree/main/packages/math/useTrunc)
- VueUse source: [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useTrunc/index.ts)
- VueUse tests: [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useTrunc/index.test.ts)
- reaxuse: [`packages/math/src/useTrunc.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/useTrunc.ts)

<Contributors name="useTrunc" />
