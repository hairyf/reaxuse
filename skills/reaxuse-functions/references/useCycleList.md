---
category: Utilities
---

# useCycleList

Cycle through a list of items

## Usage

```ts
import { useCycleList } from '@reaxuse/core'

const { state, next, prev, go } = useCycleList([
  'Dog',
  'Cat',
  'Lizard',
  'Shark',
  'Whale',
  'Dolphin',
  'Octopus',
  'Seal',
])

console.log(state) // 'Dog'

prev()

console.log(state) // 'Seal'

go(3)

console.log(state) // 'Shark'
```

## Source Forms

`list` is a read-only value source and takes a plain `T[]` (upstream:
`MaybeRefOrGetter<T[]>`). Resolve a React ref or state value at the call site:

```tsx
const [list, setList] = useState(['Dog', 'Cat'])

const { state, next } = useCycleList(list) // a new array is picked up on re-render
const { state: refState } = useCycleList(listRef.current) // resolve a React ref yourself
```

## Type Declarations

```ts
export interface UseCycleListOptions<T> {
  /**
   * The initial value of the state. A read-only value source — pass a plain
   * value (upstream: `MaybeRef<T>`; resolve a React ref at the call site).
   */
  initialValue?: T
  /**
   * The default index when the current value is not found in the list.
   */
  fallbackIndex?: number
  /**
   * Custom function to get the index of the current value.
   */
  getIndexOf?: (value: T, list: T[]) => number
}
export interface UseCycleListReturn<T> {
  /** Current item. */
  state: T
  /** Index of the current item — `fallbackIndex` (default `0`) when `state` is not in `list`. */
  index: number
  /** Go to the next item (wraps around the end of the list). */
  next: (n?: number) => T
  /** Go to the previous item (wraps around the start of the list). */
  prev: (n?: number) => T
  /**
   * Go to a specific index.
   */
  go: (i: number) => T
  /**
   * Set the current item directly (value or updater form, like `setState`).
   * React addition — upstream assigns `state.value = v` on a Vue ref.
   */
  setState: Dispatch<SetStateAction<T>>
  /**
   * Set the current index directly (same as `go`, value or updater form).
   * React addition — upstream assigns `index.value = i` on a Vue computed ref.
   */
  setIndex: Dispatch<SetStateAction<number>>
}
/**
 * React port of VueUse's `useCycleList`.
 *
 * Map from @vueuse/core `useCycleList`
 * (`source/vueuse/packages/core/useCycleList/`). Cycle through a list of
 * items — `next`/`prev` move forward/backward wrapping around, `go` jumps to
 * a specific index and the current item is exposed as `state` with its
 * position as `index`.
 *
 * Adjustments from upstream (Vue reactivity does not translate 1:1):
 *
 * 1. `state` and `index` are plain React values (upstream: `ShallowRef` and
 *    `WritableComputedRef`). They are writable through the returned
 *    `setState`/`setIndex` setters (React additions — upstream assigns
 *    `state.value`/`index.value` directly): `setIndex` is the same as `go`,
 *    while `setState` writes the item directly and `index` re-derives from
 *    `getIndexOf ?? list.indexOf`.
 * 2. `list` is a read-only value source and takes a plain `T[]` (upstream:
 *    `MaybeRefOrGetter<T[]>`; resolve a React ref or getter at the call site).
 *    It is re-read on every render, so a new array from React state is picked
 *    up like any other argument (upstream's `watch(listRef, ...)` only fires
 *    for a reactive ref, which this port does not accept).
 * 3. `next`/`prev`/`go` are stable callbacks that return the would-be value
 *    synchronously (upstream returns the new state from the `set` helper);
 *    the state commit itself is asynchronous (React `setState`).
 *
 * @example
 * const { state, next, prev, go } = useCycleList([
 *   'Dog', 'Cat', 'Lizard', 'Shark', 'Whale', 'Dolphin', 'Octopus', 'Seal',
 * ])
 *
 * state // 'Dog'
 * next() // 'Cat'
 * go(3) // 'Shark'
 */
export declare function useCycleList<T>(
  list: T[],
  options?: UseCycleListOptions<T>,
): UseCycleListReturn<T>
```
