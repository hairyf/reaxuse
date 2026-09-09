---
category: Watch
---

# useWatchOnce

Shorthand for watching value with `{ once: true }`. Once the callback fires once, the watcher will be stopped

## Usage

Similar to `useWatch`, but the callback triggers only once:

```tsx
import { useWatchOnce } from '@reaxuse/shared'

useWatchOnce(source, () => {
  // triggers only once
  console.log('source changed!')
})
```
