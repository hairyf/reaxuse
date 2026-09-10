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
