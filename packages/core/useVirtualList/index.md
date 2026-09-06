---
category: Component
---

# useVirtualList

Create virtual lists with ease — React port of VueUse's
[`useVirtualList`](https://vueuse.org/core/useVirtualList/). Virtual lists
(sometimes called _virtual scrollers_) render a large number of items
performantly by only rendering the minimum number of DOM nodes necessary to
show the items within the `container` element, using the `wrapper` element to
emulate the container element's full height.

::: warning
Consider using [`@tanstack/react-virtual`](https://tanstack.com/virtual/latest) instead, if you are looking for more features.
:::

## Usage

### Simple list

```tsx
import { useVirtualList } from '@reaxuse/core'

const { list, containerProps, wrapperProps } = useVirtualList(
  Array.from(Array.from({ length: 99999 }).keys()),
  {
    // Keep `itemHeight` in sync with the item's row.
    itemHeight: 22,
  },
)
```

```tsx
<div {...containerProps} style={{ height: '300px' }}>
  <div {...wrapperProps}>
    {list.map(item => (
      // `item` is `{ data, index }` — `index` is the absolute index
      <div key={item.index} style={{ height: 22 }}>
        Row:
        {' '}
        {item.data}
      </div>
    ))}
  </div>
</div>
```

### Reactive list

```tsx
import { useVirtualList } from '@reaxuse/core'
import { useMemo, useState } from 'react'

const allItems = Array.from(Array.from({ length: 99999 }).keys())
const [showEven, setShowEven] = useState(true)
const filteredList = useMemo(() => allItems.filter(i => (showEven ? i % 2 === 0 : i % 2 === 1)), [showEven])

const { list, containerProps, wrapperProps } = useVirtualList(
  filteredList,
  { itemHeight: 22 },
)
```

### Horizontal list

```tsx
import { useVirtualList } from '@reaxuse/core'

const allItems = Array.from(Array.from({ length: 99999 }).keys())

const { list, containerProps, wrapperProps } = useVirtualList(
  allItems,
  { itemWidth: 200 },
)
```

```tsx
<div {...containerProps} style={{ height: '300px' }}>
  <div {...wrapperProps}>
    {list.map(item => (
      <div key={item.index} style={{ width: 200 }}>
        Row:
        {' '}
        {item.data}
      </div>
    ))}
  </div>
</div>
```

### Scrolling to a specific item

`scrollTo(index, options?)` scrolls the container so the item at `index`
becomes visible, supporting `behavior` (`'auto' | 'smooth'`), `block`
(vertical alignment: `'start' | 'center' | 'end' | 'nearest'`) and `inline`
(horizontal alignment).

<DemoContainer name="UseVirtualList" />

## Type Declarations

```ts
export type MaybeRef<T> = T | { current: T }

export type UseVirtualListItemSize = number | ((index: number) => number)

export interface UseHorizontalVirtualListOptions extends UseVirtualListOptionsBase {
  itemWidth: UseVirtualListItemSize
}

export interface UseVerticalVirtualListOptions extends UseVirtualListOptionsBase {
  itemHeight: UseVirtualListItemSize
}

export interface UseVirtualListOptionsBase {
  overscan?: number
}

export type UseVirtualListOptions = UseHorizontalVirtualListOptions | UseVerticalVirtualListOptions

export interface UseVirtualListItem<T> {
  data: T
  index: number
}

export interface UseVirtualListScrollToOptions {
  behavior?: ScrollBehavior
  block?: ScrollLogicalPosition
  inline?: ScrollLogicalPosition
}

export interface UseVirtualListReturn<T> {
  list: UseVirtualListItem<T>[]
  scrollTo: (index: number, options?: UseVirtualListScrollToOptions) => void
  containerProps: {
    ref: (element: HTMLElement | null) => void
    onScroll: () => void
    style: CSSProperties
  }
  wrapperProps: {
    style: CSSProperties
  }
}

export function useVirtualList<T = any>(
  list: MaybeRef<readonly T[]>,
  options: UseVirtualListOptions,
): UseVirtualListReturn<T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useVirtualList/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useVirtualList/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useVirtualList/index.test.ts) (tests mirrored in `packages/core/src/useVirtualList.test.tsx`),
  [`component.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useVirtualList/component.ts) (component variant — not ported; React expresses the same capability with the hook and a function-as-children renderer),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useVirtualList/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useVirtualList.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useVirtualList.ts), docs + demo co-located in `packages/core/useVirtualList/`

<Contributors name="useVirtualList" />
