---
category: Elements
---

# useMutationObserver

Watch for changes being made to the DOM tree

## Usage

```tsx
import { useMutationObserver } from '@reause/core'
import { useRef, useState } from 'react'

const el = useRef<HTMLDivElement | null>(null)
const [messages, setMessages] = useState<string[]>([])

useMutationObserver(el, (mutations) => {
  if (mutations[0])
    setMessages(prev => [...prev, mutations[0].attributeName!])
}, {
  attributes: true,
})
```
