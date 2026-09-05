---
category: Array
---

# useArraySome

Reactive `Array.some` — React port of VueUse's [`useArraySome`](https://vueuse.org/shared/useArraySome/).

**Mapping:** `computed(...)` → recompute on every render (the result is a plain `boolean` — no `.value`, no caching);
`MaybeRefOrGetter` → the repo's `MaybeRef` (`T | { current: T }`), unwrapped on read — ref-like elements are re-read on
each render, so mutate `ref.current` and re-render to update the result.

## Usage

```tsx
import { useArraySome } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 4, 6, 8])
const result = useArraySome(list, i => i > 10)
// result: false

setList([...list, 11])
// result: true on the next render
```

<DemoContainer name="UseArraySome" />

## Type Declarations

```ts
export type UseArraySomeReturn = boolean

export function useArraySome<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: MaybeRef<T>[]) => unknown,
): UseArraySomeReturn
```

## Source

- VueUse: [`packages/shared/useArraySome`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useArraySome) (source + tests)
- reaxuse: [`packages/shared/src/useArraySome.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useArraySome.ts)

<Contributors name="useArraySome" />
