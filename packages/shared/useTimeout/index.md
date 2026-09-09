---
category: Animation
---

# useTimeout

A reactive value that becomes `true` after a given time

## Usage

```tsx
import { useTimeout } from '@reaxuse/shared'

const ready = useTimeout(1000) // boolean, becomes true after 1s

const { ready, start, stop } = useTimeout(1000, { controls: true })
```
