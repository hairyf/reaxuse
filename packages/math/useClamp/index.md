---
category: '@Math'
---

# useClamp

Reactively clamp a value between two other values

## Usage

```tsx
import { useClamp } from '@reaxuse/math'
import { useState } from 'react'

const [min, setMin] = useState(0)
const [max, setMax] = useState(10)
const [value, setValue] = useClamp(0, min, max)

setValue(15) // value is 10
setValue(-5) // value is 0
```

### Writable Value

When you pass a plain number or a React ref, the returned
setter clamps on write and keeps the source in sync:

```tsx
import { useClamp } from '@reaxuse/math'

const number = { current: 0 }
const [clamped, setClamped] = useClamp(number, 0, 10)

setClamped(15) // clamped is 10, number.current is 10
setClamped(-5) // clamped is 0, number.current is 0
```

### Reactive Bounds

All arguments (value, min, max) can be plain numbers or React refs. Bounds are
re-resolved on every render, so shrinking `max` re-clamps the current value:

```tsx
import { useClamp } from '@reaxuse/math'

const value = { current: 5 }
const min = { current: 0 }
const max = { current: 10 }

const [clamped] = useClamp(value, min, max)

max.current = 3 // clamped is 3 on the next render
```
