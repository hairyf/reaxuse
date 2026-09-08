---
category: '@Math'
---

# useMax

Reactive `Math.max` — React port of VueUse's
[`useMax`](https://vueuse.org/math/useMax/).

**Mapping:** `ComputedRef<number>` → pure derived hook returning a plain
`number`. Values are resolved at render time (plain numbers or React refs)
and the maximum is computed directly — no effects,
no `.value` wrapper (SSR-safe).

## Usage

```tsx
import { useMax } from '@reaxuse/math'

const array = [1, 2, 3, 4]
const max = useMax(array) // 4
```

```tsx
import { useMax } from '@reaxuse/math'

const [a, setA] = useState(1)
const [b, setB] = useState(3)

const max = useMax(a, b, 2) // 3
```

<DemoContainer name="UseMax" />

## Type Declarations

```ts
export function useMax(array: RefOrValue<RefOrValue<number>[]>): number
export function useMax(...args: RefOrValue<number>[]): number
```

## Source

- VueUse: [`packages/math/useMax`](https://github.com/vueuse/vueuse/tree/main/packages/math/useMax)
- VueUse source: [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useMax/index.ts)
- VueUse tests: [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useMax/index.test.ts)
- reaxuse: [`packages/math/src/useMax.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/useMax.ts)

<Contributors name="useMax" />
