---
category: Browser
---

# usePerformanceObserver

Observe performance metrics

## Usage

```tsx
import { usePerformanceObserver } from '@reaxuse/core'

const { isSupported, start, stop } = usePerformanceObserver(
  { entryTypes: ['paint'] },
  list => setEntrys(list.getEntries()),
)
// starts automatically (immediate: true by default) — stop() disconnects
```
