---
category: Animation
---

# useInterval

Reactive counter that increases on every interval

## Usage

```tsx
import { useInterval } from '@reaxuse/shared'

// count will increase every 200ms
const counter = useInterval(200)
// note: counter is a plain number, not a ref (no `.value`)

const { counter, reset, isActive, pause, resume } = useInterval(200, { controls: true })
```
