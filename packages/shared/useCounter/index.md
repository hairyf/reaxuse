---
category: State
---

# useCounter

A basic counter with `inc` / `dec` / `set` / `reset` and optional `min` / `max` bounds

## Basic Usage

```tsx
import { useCounter } from '@reause/shared'

const { count, inc, dec, set, reset } = useCounter()
```

## Usage with options

```tsx
import { useCounter } from '@reause/shared'

const { count, inc, dec, set, reset } = useCounter(1, { min: 0, max: 16 })
```
