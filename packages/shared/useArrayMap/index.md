---
category: Array
---

# useArrayMap

Reactive `Array.map` — React port of VueUse's [`useArrayMap`](https://vueuse.org/shared/useArrayMap/).

**Mapping:** Vue's `computed` → recompute per render and return a plain array (no `.value`);
pass a `useState` array directly and the result updates on the next render.

## Usage

```tsx
import { useArrayMap } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 1, 2, 3, 4])
const result = useArrayMap(list, i => i * 2) // [0, 2, 4, 6, 8]

setList(list.slice(0, -1)) // result === [0, 2, 4, 6] on the next render
```

<DemoContainer name="UseArrayMap" />

## Type Declarations

```ts
export type UseArrayMapReturn<T = any> = T[]

export function useArrayMap<T, U = T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: T[]) => U,
): UseArrayMapReturn<U>
```

## Source

- VueUse: [`packages/shared/useArrayMap`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useArrayMap) — [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayMap/index.ts) + [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayMap/index.test.ts)
- reaxuse: [`packages/shared/src/useArrayMap.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useArrayMap.ts)

<Contributors name="useArrayMap" />
