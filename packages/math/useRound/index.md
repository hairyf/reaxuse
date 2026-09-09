---
category: '@Math'
---

# useRound

Reactive `Math.round`

## Usage

```tsx
import { useRound } from '@reaxuse/math'

const result = useRound(20.49) // 20
```

`value` is a plain read-only `number` (upstream takes `MaybeRefOrGetter<number>`). Re-render with a
new value — e.g. from `useState` — and the hook recomputes:

```tsx
import { useRound } from '@reaxuse/math'
import { useState } from 'react'

const [value, setValue] = useState(20.49)
const result = useRound(value) // 20

setValue(-20.51) // triggers a re-render
```
