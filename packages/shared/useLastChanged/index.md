---
category: State
---

# useLastChanged

Records the timestamp of the last change

## Usage

```tsx
import { useLastChanged } from '@reaxuse/shared'
import { useState } from 'react'

const [a, setA] = useState(0)
const lastChanged = useLastChanged(a)
// note: lastChanged is a plain number (or null), not a ref (no `.value`)

setA(1)

console.log(lastChanged) // 1704709379457
```

Like upstream, the change is not recorded synchronously: it lands in a post-commit
effect, so the new timestamp shows up on the render after the change.

Seed the returned value before any change is recorded with `initialValue`
(upstream: `initialValue`):

```tsx
const lastChanged = useLastChanged(input, { initialValue: Date.now() - 1000 * 60 * 5 })
```
