---
category: '@Math'
---

# logicAnd

`AND` condition for values and refs — React port of VueUse's
[`logicAnd`](https://vueuse.org/math/logicAnd/).

**Mapping:** `ComputedRef<boolean>` → plain `boolean`. Every argument is
resolved at call time via `toValue` (plain values or React refs) and the
result is returned directly — no reactivity, no
`.value` wrapper, so the caller re-invokes on render or inside an effect
(SSR-safe).

## Usage

```tsx
import { logicAnd } from '@reaxuse/math'

const a = { current: true }
const b = { current: false }

const both = logicAnd(a, b) // false
const all = logicAnd(true, false, 1) // false
```

<DemoContainer name="LogicAnd" />

## Type Declarations

```ts
export function logicAnd(...args: RefOrValue<any>[]): boolean
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/math/logicAnd/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/logicAnd/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/logicAnd/index.test.ts) (mirrored in `logicAnd.test.tsx`)
- reaxuse: [`packages/math/src/logicAnd.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/logicAnd.ts), docs + demo co-located in `packages/math/logicAnd/`

<Contributors name="logicAnd" />
