---
category: '@Math'
alias: or
related: logicAnd, logicNot
---

# logicOr

`OR` conditions for refs — React port of VueUse's
[`logicOr`](https://vueuse.org/math/logicOr/).

**Mapping:** `ComputedRef<boolean>` → plain boolean. Every call resolves each
argument with `toValue` (plain values, `{ current }` ref-like objects or
getters) and returns `true` when any of them is truthy — a pure utility, no
effects, no `.value` wrapper (SSR-safe). The caller re-invokes it to react to
changing values.

## Usage

```tsx
import { logicOr } from '@reaxuse/math'

const a = { current: true }
const b = { current: false }

const either = logicOr(a, b) // true

a.current = false
// useLogicOr() again — both args are falsy now
logicOr(a, b) // false
```

<DemoContainer name="LogicOr" />

## Type Declarations

```ts
export function logicOr(...args: MaybeRefOrGetter<any>[]): boolean
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/math/logicOr/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/logicOr/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/logicOr/index.test.ts) (mirrored in `logicOr.test.tsx`),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/math/logicOr/index.md) (docs)
- reaxuse: [`packages/math/src/logicOr.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/logicOr.ts), docs + demo co-located in `packages/math/logicOr/`

<Contributors name="logicOr" />
