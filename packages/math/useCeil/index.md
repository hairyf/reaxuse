---
category: '@Math'
---

# useCeil

Reactive `Math.ceil`

## Usage

```tsx
import { useCeil } from '@reaxuse/math'

const value = { current: 0.95 }
const result1 = useCeil(value) // 1

value.current = -7.004
const result2 = useCeil(value) // -7
```
