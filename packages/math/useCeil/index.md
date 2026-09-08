---
category: '@Math'
---

# useCeil

Reactive `Math.ceil` — React port of VueUse's
[`useCeil`](https://vueuse.org/math/useCeil/).

**Mapping:** `ComputedRef<number>` → pure derived hook. `value` is resolved at
render time (plain number, `{ current }` ref-like object or getter) and the
ceiled number is returned directly — no effects, no `.value` wrapper
(SSR-safe).

## Usage

```tsx
import { useCeil } from '@reaxuse/math'

const value = { current: 0.95 }
const result1 = useCeil(value) // 1

value.current = -7.004
const result2 = useCeil(value) // -7
```

<DemoContainer name="UseCeil" />

## Type Declarations

```ts
export function useCeil(
  value: MaybeRefOrGetter<number>,
): number
```

## Source

- VueUse: [`packages/math/useCeil`](https://github.com/vueuse/vueuse/tree/main/packages/math/useCeil)
- VueUse source: [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useCeil/index.ts)
- VueUse tests: [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useCeil/index.test.ts)
- reaxuse: [`packages/math/src/useCeil.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/useCeil.ts)

<Contributors name="useCeil" />
