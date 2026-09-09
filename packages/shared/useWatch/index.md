---
category: Watch
---

# useWatch

Watches a source — a single value or an array of values — and invokes a callback with `(value, oldValue)` whenever it changes

## Usage

```tsx
import { useWatch } from '@reaxuse/shared'

useWatch(count, (value, oldValue) => {
  console.log(value, oldValue)
})

// array source — fires when any element changes
useWatch([count, name], (value, oldValue) => {
  console.log(value, oldValue)
})
```
