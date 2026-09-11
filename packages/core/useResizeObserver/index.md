---
category: Elements
---

# useResizeObserver

Reports changes to the dimensions of an Element's content or the border-box

## Usage

```tsx
import { useResizeObserver } from '@reause/core'
import { useRef, useState } from 'react'

const el = useRef<HTMLTextAreaElement | null>(null)
const [text, setText] = useState('')

useResizeObserver(el, (entries) => {
  const { width, height } = entries[0].contentRect
  setText(`width: ${width}, height: ${height}`)
})
```
