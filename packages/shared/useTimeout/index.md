---
category: Animation
---

# useTimeout

A reactive value that becomes `true` after a given time.

## Usage

```tsx
import { useTimeout } from '@reaxuse/shared'

const ready = useTimeout(1000)
```

After 1 second, `ready` becomes `true`.

### With Controls

```tsx
import { useTimeout } from '@reaxuse/shared'

const { ready, start, stop, isPending } = useTimeout(1000, { controls: true })

// Check if timeout is pending
console.log(isPending) // true

// Stop the timeout
stop()

// Start/restart the timeout
start()
```

### Options

| Option      | Type         | Default | Description                                      |
| ----------- | ------------ | ------- | ------------------------------------------------ |
| `controls`  | `boolean`    | `false` | Expose `start`, `stop`, and `isPending` controls |
| `immediate` | `boolean`    | `true`  | Start the timeout immediately                    |
| `callback`  | `() => void` | —       | Called when the timeout completes                |

### Callback on Timeout

```tsx
import { useTimeout } from '@reaxuse/shared'

useTimeout(1000, {
  callback: () => {
    console.log('Timeout completed!')
  },
})
```

### Reactive Interval

The timeout duration can be reactive:

```tsx
import { useTimeout } from '@reaxuse/shared'
import { useRef } from 'react'

const duration = useRef(1000)
const ready = useTimeout(duration)

// Change the duration (only affects future timeouts when using controls)
duration.current = 2000
```
