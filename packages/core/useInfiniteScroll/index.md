---
category: Sensors
---

# useInfiniteScroll

Infinite scrolling of the element

## Usage

```tsx
import { useInfiniteScroll } from '@reause/core'
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
