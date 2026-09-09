---
category: State
---

# useCounter

A basic counter with `inc` / `dec` / `set` / `reset` and optional `min` / `max` bounds

## Usage

```tsx
import { useCounter } from '@reaxuse/shared'

const { count, inc, dec, set, reset } = useCounter(0, { min: 0, max: 10 })

inc() // +1
inc(5) // +5
dec() // -1
set(3) // = 3 (clamped to [min, max])
reset() // back to initialValue
```
