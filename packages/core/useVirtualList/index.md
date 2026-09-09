---
category: Component
---

# useVirtualList

Create virtual lists with ease

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
