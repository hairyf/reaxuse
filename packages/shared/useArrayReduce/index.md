---
category: Array
---

# useArrayReduce

Reactive `Array.reduce` — React port of VueUse's [`useArrayReduce`](https://vueuse.org/shared/useArrayReduce/).

**Mapping:** Vue's `computed` → recompute per render and return a plain value (no `.value`);
pass a `useState` array directly and the result updates on the next render.

## Usage

```tsx
import { useArrayReduce } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([1, 2, 3, 4])
const sum = useArrayReduce(list, (prev, item) => prev + item, 0) // 10

setList([...list, 5]) // sum === 15 on the next render
```

<DemoContainer name="UseArrayReduce" />

## Type Declarations

```ts
export type UseArrayReducer<PV, CV, R> = (previousValue: PV, currentValue: CV, currentIndex: number) => R

export type UseArrayReduceReturn<T = any> = T

export function useArrayReduce<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  reducer: UseArrayReducer<T, T, T>,
): UseArrayReduceReturn<T>
export function useArrayReduce<T, U>(
  list: MaybeRef<MaybeRef<T>[]>,
  reducer: UseArrayReducer<U, T, U>,
  initialValue: MaybeRef<U>,
): UseArrayReduceReturn<U>
```

## Source

- VueUse: [`packages/shared/useArrayReduce`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useArrayReduce) — [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayReduce/index.ts) + [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayReduce/index.test.ts)
- reaxuse: [`packages/shared/src/useArrayReduce.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useArrayReduce.ts)

<Contributors name="useArrayReduce" />
