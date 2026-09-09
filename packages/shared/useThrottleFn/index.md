---
category: Utilities
---

# useThrottleFn

Throttle execution of a function

## Usage

```tsx
import { useThrottleFn } from '@reaxuse/shared'
import { useEffect } from 'react'

const throttledFn = useThrottleFn(() => {
  // do something, it will be called at most 1 time per second
}, 1000)

useEffect(() => {
  window.addEventListener('resize', throttledFn)
  return () => window.removeEventListener('resize', throttledFn)
}, [throttledFn])
// note: returned fn is referentially stable so effects don't re-subscribe;
// ms accepts a number, a React ref
```
