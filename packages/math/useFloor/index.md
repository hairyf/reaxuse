---
category: '@Math'
---

# useFloor

Reactive `Math.floor`

## Usage

```tsx
import { useFloor } from '@reaxuse/math'

const value = { current: 45.95 }
const result = useFloor(value) // 45

value.current = -45.05 // result === -46 on the next render
```
