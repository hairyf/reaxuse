---
category: Array
---

# useArrayUnique

Reactive `Array.unique` — React port of VueUse's [`useArrayUnique`](https://vueuse.org/shared/useArrayUnique/).

**Mapping:** `computed(...)` → recompute on every render (the result is a plain deduped array — no `.value`, no caching);
`MaybeRefOrGetter` → the repo's `MaybeRef` (`T | { current: T }`), unwrapped on read — the list itself may be ref-like and
every element is unwrapped before the dedupe, so mutate `ref.current` and re-render to update the result. Duplicate
detection uses a `Set` of the unwrapped values (reference identity for objects) unless a custom `compareFn` is provided,
same as upstream.

## Usage

```tsx
import { useArrayUnique } from '@reaxuse/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 2, 4, 4, 4])
const result = useArrayUnique(list)
// result: [0, 2, 4]

setList([0, 2, 4, 6, 6])
// result: [0, 2, 4, 6] on the next render
```

<DemoContainer name="UseArrayUnique" />

## Type Declarations

```ts
export type UseArrayUniqueReturn<T = any> = T[]

export function useArrayUnique<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  compareFn?: (a: T, b: T, array: T[]) => boolean,
): UseArrayUniqueReturn<T>
```

## Source

- VueUse: [`packages/shared/useArrayUnique`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useArrayUnique) (source + tests)
- reaxuse: [`packages/shared/src/useArrayUnique.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useArrayUnique.ts)

<Contributors name="useArrayUnique" />
