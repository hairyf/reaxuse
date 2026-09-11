---
category: Array
---

# useArrayFindLast

Reactive `Array.findLast`.

## Usage

```tsx
import { useArrayFindLast } from '@reause/shared'

const list = [1, -1, 2]
const positive = useArrayFindLast(list, val => val > 0) // 2
```

### Use with reactive array

```tsx
import { useArrayFindLast } from '@reause/shared'
import { useState } from 'react'

const [list, setList] = useState([-1, -2])
const positive = useArrayFindLast(list, val => val > 0) // undefined

setList([...list, 10])
// positive: 10 on the next render

setList([...list, 5])
// positive: 5 on the next render
```

`list` is a plain read-only array: pass the array directly (e.g. from
`useState`), or `ref.current` if you keep it in a ref. The result recomputes on
the render that passes a new array.

## Type Declarations

```ts
export type UseArrayFindLastReturn<T = any> = T | undefined
/**
 * React port of VueUse's `useArrayFindLast`.
 *
 * Map from @vueuse/shared `useArrayFindLast`
 * Mapping: upstream wraps native `Array.prototype.findLast` (with a loop
 * fallback for runtimes without it) in `computed(() => ...)` and returns a
 * `ComputedRef`; React has no reactive value tracking, so this is a plain
 * function recomputed on every render over the plain `list` array the caller
 * passes — the loop helper stands in for the native method since the repo
 * targets lib ES2022. Hold the array in `useState` and pass a new array to
 * observe a change — the last match is returned on the next render.
 *
 * @see https://vueuse.org/shared/useArrayFindLast/
 *
 * @example
 * const [list, setList] = useState([1, -1, 2])
 * useArrayFindLast(list, val => val > 0) // 2
 * setList([1, -1, -2]) // 1 on the next render
 */
export declare function useArrayFindLast<T>(
  list: readonly T[],
  fn: (element: T, index: number, array: readonly T[]) => boolean,
): UseArrayFindLastReturn<T>
```
