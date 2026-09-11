---
category: Elements
---

# useElementOverflow

Reactive element's overflow state

## Usage

```tsx
import { useElementOverflow } from '@reause/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement | null>(null)
const { isXOverflowed } = useElementOverflow(el, { observeMutation: true })

// <div ref={el} style={{ width: 100, overflow: 'hidden' }}>
//   {isXOverflowed ? <button>show more</button> : <span>some words may be too long to show here</span>}
// </div>
```
