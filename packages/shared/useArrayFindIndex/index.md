---
category: Array
---

# useArrayFindIndex

Reactive `Array.findIndex` — React port of VueUse's [`useArrayFindIndex`](https://vueuse.org/shared/useArrayFindIndex/).

**Mapping:** upstream wraps `toValue(list).findIndex(...)` in `computed(...)` and accepts a `MaybeRefOrGetter`; React has no implicit reactivity, so `useArrayFindIndex` is a plain function that recomputes the index on each render — pass a state array (upstream: reactive array) and re-render with new state to see the updated result. The return is a plain number, no `.value`.

## Usage

```tsx
import { useArrayFindIndex } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 4, 6, 8])

const result = useArrayFindIndex(list, i => i % 2 === 0) // 0

setList([1, 3, 5, 7, 9]) // result === -1 on the next render
```

<DemoContainer name="UseArrayFindIndex" />

## Type Declarations

```ts
export type UseArrayFindIndexReturn = number
export function useArrayFindIndex<T>(list: T[], fn: (element: T, index: number, array: T[]) => unknown): UseArrayFindIndexReturn
```

## Source

- VueUse docs: [`useArrayFindIndex`](https://vueuse.org/shared/useArrayFindIndex/)
- VueUse source: [`packages/shared/useArrayFindIndex/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayFindIndex/index.ts)
- VueUse tests: [`packages/shared/useArrayFindIndex/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayFindIndex/index.test.ts)
- reaxuse: [`packages/shared/src/useArrayFindIndex.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useArrayFindIndex.ts)

<Contributors name="useArrayFindIndex" />
