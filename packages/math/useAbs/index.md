---
category: '@Math'
---

# useAbs

Reactive `Math.abs`

## Usage

```tsx
import { useAbs } from '@reaxuse/math'

const value = { current: -23 }
const result = useAbs(value) // 23

value.current = 23 // result === 23 on the next render
```
