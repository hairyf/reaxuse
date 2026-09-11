---
category: Sensors
---

# usePointerSwipe

Reactive swipe detection based on [PointerEvents](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent)

## Usage

```tsx
import { usePointerSwipe } from '@reause/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement>(null)
const { isSwiping, direction } = usePointerSwipe(el, {
  threshold: 50,
  onSwipeEnd: (e, direction) => console.log(direction),
})
// direction: 'up' | 'down' | 'left' | 'right' | 'none'
```
