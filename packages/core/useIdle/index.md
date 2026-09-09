---
category: Sensors
---

# useIdle

Tracks whether the user is being inactive

## Usage

```tsx
import { useIdle } from '@reaxuse/core'

const { idle, lastActive, reset } = useIdle(5 * 60 * 1000) // 5 min

console.log(idle) // true or false
```

`reset()` restarts the idle timer without touching `lastActive`.
