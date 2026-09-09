---
category: Animation
---

# useIntervalFn

Wrapper for `setInterval` with controls

## Usage

```tsx
import { useIntervalFn } from '@reaxuse/shared'

const { isActive, pause, resume } = useIntervalFn(() => {
  /* ... */
}, 1000)
```
