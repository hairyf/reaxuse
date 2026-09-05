---
category: Array
---

# useArrayFind

Reactive `Array.find` — React port of VueUse's [`useArrayFind`](https://vueuse.org/shared/useArrayFind/).

**Mapping:** upstream wraps `toValue(list).find(...)` in `computed(() => ...)` and returns a `ComputedRef`;
React has no implicit reactivity, so `useArrayFind` is a plain function recomputed on every render.
Refs map to `{ current }` objects: elements are unwrapped before the predicate runs, the first match
is returned unwrapped, and mutations show up on the next render.

## Usage

```tsx
import { useArrayFind } from '@reaxuse/shared'

const list = [{ current: 1 }, { current: -1 }, { current: 2 }]
const positive = useArrayFind(list, val => val > 0) // 1

list[0].current = 3 // positive === 3 on the next render
```

<DemoContainer name="UseArrayFind" />

## Type Declarations

```ts
export type UseArrayFindReturn<T = any> = T | undefined

export function useArrayFind<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  fn: (element: T, index: number, array: MaybeRef<T>[]) => boolean,
): UseArrayFindReturn<T>
```

## Source

- VueUse: [`packages/shared/useArrayFind/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayFind/index.ts)
- VueUse tests: [`packages/shared/useArrayFind/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useArrayFind/index.test.ts)
- reaxuse: [`packages/shared/src/useArrayFind.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useArrayFind.ts)

<Contributors name="useArrayFind" />
