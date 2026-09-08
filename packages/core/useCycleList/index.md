---
category: Utilities
---

# useCycleList

Cycle through a list of items — React port of VueUse's [`useCycleList`](https://vueuse.org/core/useCycleList/).

**Mapping:** object-mirror hook — `state` is the current item (React state, written through the returned `setState`
setter; upstream assigns `state.value` on a Vue ref), `index` the position of the current item (derived on every render
from `getIndexOf ?? list.indexOf`, falling back to `fallbackIndex`/`0`; writable through `setIndex`, same as `go`), and
`next`/`prev`/`go` are stable callbacks returning the would-be value. `list` accepts a plain array or a React
ref; when a ref list's `current` is replaced, the current index is
re-applied to the new list (upstream: `watch(listRef, ...)`).

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

<DemoContainer name="UseCycleList" />

## Type Declarations

```ts
export interface UseCycleListOptions<T> {
  /** The initial value of the state. A ref can be provided to reuse. */
  initialValue?: RefOrValue<T>
  /** The default index when the current value is not found in the list. */
  fallbackIndex?: number
  /** Custom function to get the index of the current value. */
  getIndexOf?: (value: T, list: T[]) => number
}

export interface UseCycleListReturn<T> {
  state: T
  index: number
  next: (n?: number) => T
  prev: (n?: number) => T
  go: (i: number) => T
  setState: Dispatch<SetStateAction<T>>
  setIndex: Dispatch<SetStateAction<number>>
}

export function useCycleList<T>(list: RefOrValue<T[]>, options?: UseCycleListOptions<T>): UseCycleListReturn<T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useCycleList/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCycleList/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCycleList/index.browser.test.ts) (mirrored by `useCycleList.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCycleList/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useCycleList.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useCycleList.ts), docs + demo co-located in `packages/core/useCycleList/`

<Contributors name="useCycleList" />
