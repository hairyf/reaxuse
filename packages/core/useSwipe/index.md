---
category: Sensors
---

# useSwipe

Reactive swipe detection based on [`TouchEvents`](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent)

## Usage

```tsx
import { useSwipe } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement>(null)
const { isSwiping, direction, lengthX, lengthY } = useSwipe(el, {
  threshold: 50,
  onSwipeEnd: (e, direction) => console.log(direction),
})
// direction: 'up' | 'down' | 'left' | 'right' | 'none'
```
