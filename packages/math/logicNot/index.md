---
category: '@Math'
---

# logicNot

`NOT` condition for values, refs and getters — React port of VueUse's
[`logicNot`](https://vueuse.org/math/logicNot/).

**Mapping:** `ComputedRef<boolean>` → plain `boolean`. The argument is
resolved at call time via `toValue` (a plain value, `{ current }` ref-like
object or getter) and the negation is returned directly — no reactivity, no
`.value` wrapper, so the caller re-invokes on render or inside an effect
(SSR-safe).

## Usage

```tsx
import { logicNot } from '@reaxuse/math'

const a = { current: true }

const notA = logicNot(a) // false — re-evaluated on every call
const notGetter = logicNot(() => a.current) // false
```

<DemoContainer name="LogicNot" />

## Type Declarations

```ts
export function logicNot(v: MaybeRefOrGetter<any>): boolean
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/math/logicNot/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/logicNot/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/logicNot/index.test.ts) (mirrored in `logicNot.test.tsx`)
- reaxuse: [`packages/math/src/logicNot.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/logicNot.ts), docs + demo co-located in `packages/math/logicNot/`

<Contributors name="logicNot" />
