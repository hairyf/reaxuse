---
category: Sensors
---

# useScrollLock

Lock scrolling of the element

## Usage

```tsx
import { useScrollLock } from '@reause/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement>(null)
const [isLocked, setIsLocked] = useScrollLock(el)

setIsLocked(true) // lock
setIsLocked(false) // unlock
```
