---
category: Utilities
---

# useStepper

Multi-step wizard helpers

## Usage

```tsx
import { useStepper } from '@reaxuse/core'

const { steps, index, current, next, previous, goTo, isFirst, isLast }
  = useStepper(['billing-address', 'terms', 'payment'])

console.log(current) // 'billing-address'
// note: current/index are plain values (no `.value`); goTo/next/previous are stable callbacks
```
