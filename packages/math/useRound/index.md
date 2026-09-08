---
category: '@Math'
---

# useRound

Reactive `Math.round` — React port of VueUse's
[`useRound`](https://vueuse.org/math/useRound/).

**Mapping:** `ComputedRef<number>` → pure derived hook. `value` is resolved at
render time (plain number, `{ current }` ref-like object or getter) and the
rounded number is returned directly — no effects, no `.value` wrapper
(SSR-safe).

## Usage

```tsx
import { useRound } from '@reaxuse/math'

const value = { current: 20.49 }
const result = useRound(value) // 20

value.current = -20.51 // result === -21 on the next render
```

<DemoContainer name="UseRound" />

## Type Declarations

```ts
export function useRound(
  value: MaybeRefOrGetter<number>,
): number
```

## Source

- VueUse: [`packages/math/useRound`](https://github.com/vueuse/vueuse/tree/main/packages/math/useRound)
- VueUse source: [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useRound/index.ts)
- VueUse tests: [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useRound/index.test.ts)
- reaxuse: [`packages/math/src/useRound.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/useRound.ts)

<Contributors name="useRound" />
