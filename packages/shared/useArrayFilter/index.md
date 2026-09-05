---
category: Array
---

# useArrayFilter

Reactive `Array.filter` — React port of VueUse's [`useArrayFilter`](https://vueuse.org/shared/useArrayFilter/).

**Mapping:** Vue's `computed` → recompute per render and return a plain array (no `.value`);
pass a `useState` array directly and the filtered result updates on the next render.

## Usage

```tsx
import { useArrayFilter } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
const evens = useArrayFilter(list, i => i % 2 === 0) // [0, 2, 4, 6, 8]

setList(list.slice(1)) // evens === [2, 4, 6, 8] on the next render
```

<DemoContainer name="UseArrayFilter" />

## Type Declarations

```ts
export type UseArrayFilterReturn<T = any> = T[]

export function useArrayFilter<T, S extends T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: T[]) => element is S,
): UseArrayFilterReturn<S>
export function useArrayFilter<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: T[]) => unknown,
): UseArrayFilterReturn<T>
```

## Source

- VueUse: [`packages/shared/useArrayFilter`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useArrayFilter) — [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayFilter/index.ts) + [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayFilter/index.test.ts)
- reaxuse: [`packages/shared/src/useArrayFilter.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useArrayFilter.ts)

<Contributors name="useArrayFilter" />
