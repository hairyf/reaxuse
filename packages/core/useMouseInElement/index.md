---
category: Elements
---

# useMouseInElement

Reactive mouse position related to an element

## Usage

```tsx
import { useMouseInElement } from '@reaxuse/core'
import { useRef } from 'react'

const target = useRef<HTMLDivElement>(null)

const { x, y, elementX, elementY, isOutside } = useMouseInElement(target)
```

```tsx
<div ref={target}>
  <h1>Hello world</h1>
</div>
```
