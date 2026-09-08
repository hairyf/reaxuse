---
category: Sensors
---

# useInfiniteScroll

Infinite scrolling of the element — React port of VueUse's
[`useInfiniteScroll`](https://vueuse.org/core/useInfiniteScroll/).

**Mapping:** the hook calls `onLoadMore` whenever the element is scrolled to the requested
edge (within `distance` pixels), is visible in the viewport and `canLoadMore` returns `true`.
Edge detection is delegated to `useScroll` (the `distance` is folded into the `offset` of the
listened direction) and viewport visibility to `useElementVisibility` — `Window` / `Document`
targets are reduced to their `documentElement`, mirroring upstream's `resolveElement`. Upstream
wraps `useScroll` in `reactive` and `watch`es the arrived/visibility/canLoad values with an
immediate post-flush watcher; the React port drives the same check from a post-commit
`useEffect`, re-measuring and re-checking in one batched commit after each `onLoadMore` settles.
`isLoading` (a `ComputedRef` upstream) is a plain `boolean` state value. The `v-infinite-scroll`
directive is a Vue feature and is not ported.

## Usage

```tsx
import { useInfiniteScroll } from '@reaxuse/core'
import { useRef, useState } from 'react'

const el = useRef<HTMLDivElement>(null)
const [data, setData] = useState([1, 2, 3, 4, 5, 6])

const { reset } = useInfiniteScroll(el, () => {
  // load more
  setData(d => [...d, ...moreData])
}, {
  distance: 10,
  canLoadMore: () => {
    // indicate when there is no more content to load so onLoadMore stops triggering
    // if (noMoreContent) return false
    return true // for demo purposes
  },
})

function resetList() {
  setData([])
  reset()
}
```

```tsx
<>
  <div ref={el}>
    {data.map(item => <div key={item}>{item}</div>)}
  </div>
  <button onClick={resetList}>Reset</button>
</>
```

## Direction

Different scroll directions require different CSS style settings:

| Direction          | Required CSS                                          |
| ------------------ | ----------------------------------------------------- |
| `bottom` (default) | No special settings required                          |
| `top`              | `display: flex;`<br>`flex-direction: column-reverse;` |
| `left`             | `display: flex;`<br>`flex-direction: row-reverse;`    |
| `right`            | `display: flex;`                                      |

::: warning
Make sure to indicate when there is no more content to load with `canLoadMore`, otherwise `onLoadMore` will trigger as long as there is space for more content.
:::

<DemoContainer name="UseInfiniteScroll" />

## Type Declarations

```ts
export type InfiniteScrollElement = HTMLElement | SVGElement | Window | Document | null | undefined

export interface UseInfiniteScrollOptions<T extends InfiniteScrollElement = InfiniteScrollElement>
  extends UseScrollOptions {
  distance?: number
  direction?: 'top' | 'bottom' | 'left' | 'right'
  interval?: number
  canLoadMore?: (el: T) => boolean
}

export interface UseInfiniteScrollReturn {
  isLoading: boolean
  reset: () => void
}

export function useInfiniteScroll<T extends InfiniteScrollElement>(
  element: RefOrValue<T>,
  onLoadMore: (state: UseScrollReturn) => Awaitable<void>,
  options?: UseInfiniteScrollOptions<T>,
): UseInfiniteScrollReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useInfiniteScroll/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useInfiniteScroll/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useInfiniteScroll/index.browser.test.ts) (mirrored in `packages/core/src/useInfiniteScroll.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useInfiniteScroll/demo.vue) (ported to `demo.tsx` below),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/core/useInfiniteScroll/index.md)
- The upstream `directive.ts` variant (`vInfiniteScroll`) is a Vue directive and is not ported —
  React has no directive equivalent; use the hook inside a component instead.
- reaxuse: [`packages/core/src/useInfiniteScroll.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useInfiniteScroll.ts), docs + demo co-located in `packages/core/useInfiniteScroll/`

<Contributors name="useInfiniteScroll" />
