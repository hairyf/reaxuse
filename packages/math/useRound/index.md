---
category: '@Math'
---

# useRound

Reactive `Math.round`

## Usage

```tsx
import { useRound } from '@reaxuse/math'

const value = { current: 20.49 }
const result = useRound(value) // 20

value.current = -20.51 // result === -21 on the next render
```
