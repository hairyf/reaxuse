---
category: Watch
---

# useWatchArray

Watches an array value and reports which items were added and removed since the previous
list — React port of VueUse's
[`watchArray`](https://vueuse.org/shared/useWatchArray/).

**Mapping:** built on the house `useWatch` — the list is a plain array value tracked across
renders and `useWatch` handles the change detection, while the previous list is diffed
against the next one with item-identity matching (like upstream) to produce `added` /
`removed`. The list is wrapped as a single-element watch source, so tracking is by
reference identity: replacing the array fires the callback (like a Vue ref reassignment,
even when the items are identical), while re-renders keeping the same reference do not.
Vue's `WatchSource` forms (ref / getter / reactive) have no React equivalent — compute the
array during render and pass it directly. In-place mutations (`push` / `splice`) must
produce a new array to trigger React. The upstream `onCleanup` callback parameter is not
ported.

## Usage

```tsx
import { useWatchArray } from '@reaxuse/shared'

useWatchArray(list, (newList, oldList, added, removed) => {
  console.log(`added: ${added}`, `removed: ${removed}`)
})

// fire once on mount with the current list
useWatchArray(list, (newList, oldList, added, removed) => {
  console.log(newList, oldList, added, removed)
}, { immediate: true })
```

<DemoContainer name="UseWatchArray" />

## Type Declarations

```ts
export interface UseWatchArrayCallback<V = any, OV = any> {
  (value: V, oldValue: OV, added: V, removed: OV): void
}

export interface UseWatchArrayOptions<Immediate extends Readonly<boolean> = false> {
  immediate?: Immediate
}

export function useWatchArray<T, Immediate extends Readonly<boolean> = false>(source: T[], callback: UseWatchArrayCallback<T[], Immediate extends true ? T[] | undefined : T[]>, options?: UseWatchArrayOptions<Immediate>): void
```

## Source

- VueUse: [`watchArray`](https://vueuse.org/shared/useWatchArray/)
- VueUse source: [`packages/shared/watchArray/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchArray/index.ts)
- VueUse tests: [`packages/shared/watchArray/index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/watchArray/index.test.ts)
- reaxuse: [`packages/shared/src/useWatchArray.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useWatchArray.ts)

<Contributors name="useWatchArray" />
