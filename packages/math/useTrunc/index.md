---
category: '@Math'
---

# useTrunc

Reactive `Math.trunc`

## Usage

```tsx
import { useTrunc } from '@reaxuse/math'

const value = { current: 0.95 }
const result1 = useTrunc(value) // 0

value.current = -2.34
const result2 = useTrunc(value) // -2
```
