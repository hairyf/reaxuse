---
category: Animation
---

# useTimeoutFn

Wrapper for `setTimeout` with controls

## Usage

```tsx
import { useTimeoutFn } from '@reause/shared'

const { isPending, start, stop } = useTimeoutFn(() => {
  /* ... */
}, 3000)
```
