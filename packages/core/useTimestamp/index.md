---
category: Animation
---

# useTimestamp

Reactive current timestamp (`Date.now() + offset`), updating on every animation frame

## Usage

```tsx
import { useTimestamp } from '@reaxuse/core'

const timestamp = useTimestamp({ offset: 0 }) // updates every animation frame
```
