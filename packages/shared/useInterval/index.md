---
category: Animation
---

# useInterval

Reactive counter that increases on every interval.

## Usage

```tsx
import { useInterval } from '@reause/shared'

// count will increase every 200ms
const counter = useInterval(200)
```

### With Controls

```tsx
import { useInterval } from '@reause/shared'

const { counter, reset, pause, resume, isActive } = useInterval(200, {
  controls: true,
})

// Reset counter to 0
reset()

// Pause/resume the interval
pause()
resume()
```

### Options

| Option      | Type                      | Default | Description                                                |
| ----------- | ------------------------- | ------- | ---------------------------------------------------------- |
| `controls`  | `boolean`                 | `false` | Expose `pause`, `resume`, `reset`, and `isActive` controls |
| `immediate` | `boolean`                 | `true`  | Start the interval immediately                             |
| `callback`  | `(count: number) => void` | —       | Called on every interval with the current count            |

### Reactive Interval

The interval can be reactive:

```tsx
import { useInterval } from '@reause/shared'
import { useState } from 'react'

const [intervalMs, setIntervalMs] = useState(1000)
const counter = useInterval(intervalMs)

// Change the interval dynamically (restarts the running timer)
setIntervalMs(500)
```

### Callback on Every Interval

```tsx
import { useInterval } from '@reause/shared'

useInterval(1000, {
  callback: (count) => {
    console.log(`Tick ${count}`)
  },
})
```
