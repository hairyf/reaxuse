---
category: Array
---

# useArrayEvery

Reactive `Array.every`

## Usage

### Use with array of multiple refs

```tsx
import { useArrayEvery } from '@reause/shared'
import { useState } from 'react'

const [item1, setItem1] = useState(0)
const [item2, setItem2] = useState(2)
const [item3, setItem3] = useState(4)
const [item4, setItem4] = useState(6)
const [item5, setItem5] = useState(8)
const list = [item1, item2, item3, item4, item5]
const result = useArrayEvery(list, i => i % 2 === 0) // true

setItem1(1)
// result: false on the next render
```

### Use with reactive array

```tsx
import { useArrayEvery } from '@reause/shared'
import { useState } from 'react'

const [list, setList] = useState([0, 2, 4, 6, 8])
const result = useArrayEvery(list, i => i % 2 === 0) // true

setList([...list, 9])
// result: false on the next render
```

`list` is a plain read-only array: pass the array directly (e.g. from
`useState`), or `ref.current` if you keep it in a ref. The result recomputes on
the render that passes a new array.

## Type Declarations

```ts
export type UseArrayEveryReturn = boolean
/**
 * React port of VueUse's `useArrayEvery`.
 *
 * Map from @vueuse/shared `useArrayEvery`
 * Mapping: upstream wraps `toValue(list).every(...)` in `computed(() => ...)`
 * and returns a `ComputedRef`; React has no reactive value tracking, so this
 * is a plain function recomputed on every render over the plain `list` array
 * the caller passes. Hold the array in `useState` (or any render-scoped value)
 * and pass a new array to observe a change — the result recomputes on the next
 * render. The predicate may return any value (coerced by truthiness, like
 * `Array.prototype.every`).
 *
 * @see https://vueuse.org/shared/useArrayEvery/
 *
 * @example
 * const [list, setList] = useState([0, 2, 4])
 * useArrayEvery(list, val => val % 2 === 0) // true
 * setList([0, 2, 5]) // false on the next render
 *
 * @param list - the array was called upon.
 * @param fn - a function to test each element.
 *
 * @returns **true** if the `fn` function returns a **truthy** value for every element from the array. Otherwise, **false**.
 */
export declare function useArrayEvery<T>(
  list: readonly T[],
  fn: (element: T, index: number, array: readonly T[]) => unknown,
): UseArrayEveryReturn
```
