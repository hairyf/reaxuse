---
category: Elements
---

# useWindowScroll

Reactive window scroll

## Usage

```tsx
import { useWindowScroll } from '@reaxuse/core'

const { x, y, isScrolling, arrivedState, directions, setX, setY } = useWindowScroll()

// read the current scroll position: x, y
setX(100) // scroll X to 100
setY(100) // scroll Y to 100
```

Scroll with smooth behavior:

```tsx
const { setX, setY } = useWindowScroll({ behavior: 'smooth' })
```

Detect the scroll edges within `offset` pixels (default `30`) and the last movement
direction:

```tsx
const { arrivedState, directions } = useWindowScroll({ offset: { bottom: 100 } })

// load more items when near the bottom
if (arrivedState.bottom)
  console.log('arrived at the bottom')

// scrolling down
if (directions.bottom)
  console.log('scrolling down')
```
