---
category: '@Math'
---

# useMath

Reactive `Math` methods — React port of VueUse's
[`useMath`](https://vueuse.org/math/useMath/).

**Mapping:** `ComputedRef<number>` → pure derived hook. Pass a `Math` method
name as the key and its arguments (plain numbers, `{ current }` ref-like
objects or getters); the result is recomputed on every render and returned
directly — no effects, no `.value` wrapper (SSR-safe).

## Usage

```tsx
import { useMath } from '@reaxuse/math'
import { useState } from 'react'

const [base, setBase] = useState(2)
const [exponent, setExponent] = useState(3)
const result = useMath('pow', base, exponent) // 8

const [num, setNum] = useState(2)
const root = useMath('sqrt', num) // 1.4142135623730951

setNum(4) // triggers a re-render
// root === 2
```

Plain values, `{ current }` ref-like objects and getters are all accepted:

```tsx
import { useMath } from '@reaxuse/math'

const power = useMath('pow', 2, 3) // 8

const base = { current: 2 }
const exponent = { current: 3 }
const refPower = useMath('pow', base, exponent) // 8

const getterPower = useMath('pow', () => 2, () => 3) // 8
```

<DemoContainer name="UseMath" />

## Type Declarations

```ts
export type UseMathKeys = keyof { [K in keyof Math as Math[K] extends (...args: any) => any ? K : never]: unknown }

export type UseMathReturn<K extends keyof Math> = ReturnType<Reactified<Math[K], true>>

export function useMath<K extends keyof Math>(
  key: K,
  ...args: ArgumentsType<Reactified<Math[K], true>>
): UseMathReturn<K>
```

## Source

- VueUse: [`packages/math/useMath`](https://github.com/vueuse/vueuse/tree/main/packages/math/useMath)
- VueUse source: [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useMath/index.ts)
- VueUse tests: [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/math/useMath/index.test.ts)
- reaxuse: [`packages/math/src/useMath.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/math/src/useMath.ts)

<Contributors name="useMath" />
