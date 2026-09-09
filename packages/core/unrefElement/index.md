---
category: Component
---

# unrefElement

Get the DOM element of a React ref-like object or a plain element

## Usage

```tsx
import { unrefElement } from '@reaxuse/core'
import { useEffect, useRef } from 'react'

const div = useRef<HTMLDivElement>(null)

useEffect(() => {
  console.log(unrefElement(div)) // the <div> element (div.current)
})
```

A plain element works the same way:

```tsx
console.log(unrefElement(div.current)) // the <div> element
```
