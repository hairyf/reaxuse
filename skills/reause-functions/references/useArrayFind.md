---
category: Array
---

# useArrayFind

Reactive `Array.find`.

## Usage

```tsx
import { useArrayFind } from '@reause/shared'

const list = [1, -1, 2]
const positive = useArrayFind(list, val => val > 0) // 1
```

### Use with reactive array

```tsx
import { useArrayFind } from '@reause/shared'
import { useState } from 'react'

const [list, setList] = useState([-1, -2])
const positive = useArrayFind(list, val => val > 0) // undefined

setList([...list, 1])
// positive: 1 on the next render
```

`list` is a plain read-only array: pass the array directly (e.g. from
`useState`), or `ref.current` if you keep it in a ref. The result recomputes on
the render that passes a new array.

## Type Declarations

```ts
export type UseArrayFindReturn<T = any> = T | undefined
/**
 * React port of VueUse's `useArrayFind`.
 *
 * Map from @vueuse/shared `useArrayFind`
 * Mapping: upstream wraps `toValue(list).find(...)` in `computed(() => ...)`
 * and returns a `ComputedRef`; React has no reactive value tracking, so this
 * is a plain function recomputed on every render over the plain `list` array
 * the caller passes. Hold the array in `useState` and pass a new array to
 * observe a change — the first match is returned on the next render.
 *
 * @see https://vueuse.org/shared/useArrayFind/
 *
 * @example
 * const [list, setList] = useState([1, -1, 2])
 * useArrayFind(list, val => val > 0) // 1
 * setList([3, -1, 2]) // 3 on the next render
 */
export declare function useArrayFind<T>(
  list: readonly T[],
  fn: (element: T, index: number, array: readonly T[]) => boolean,
): UseArrayFindReturn<T>
```
