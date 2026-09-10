---
category: Elements
---

# useIntersectionObserver

Detects changes to a target element's visibility

## Usage

```tsx
import { useIntersectionObserver } from '@reaxuse/core'
import { useRef, useState } from 'react'

const target = useRef<HTMLDivElement | null>(null)
const [targetIsVisible, setIsVisible] = useState(false)

const { stop } = useIntersectionObserver(
  target,
  ([entry]) => {
    setIsVisible(entry?.isIntersecting || false)
  },
)
```

### Controls and cleanup

`useIntersectionObserver` returns controls for the underlying observer:

| State         | Type         | Description                                                                           |
| ------------- | ------------ | ------------------------------------------------------------------------------------- |
| `isSupported` | `boolean`    | Whether the `IntersectionObserver` API is available.                                  |
| `isActive`    | `boolean`    | Whether the observer is currently running. Turns `false` after `pause()` or `stop()`. |
| `pause`       | `() => void` | Pause observing and set `isActive` to `false`.                                        |
| `resume`      | `() => void` | Resume observing.                                                                     |
| `stop`        | `() => void` | Stop observing permanently.                                                           |

The observer is disconnected automatically on unmount, so in most cases you don't need to call
`stop` yourself. Call `stop()` to disconnect the observer earlier, for example once the element has
become visible:

```ts
const { stop } = useIntersectionObserver(
  target,
  ([entry]) => {
    if (entry?.isIntersecting) {
      // react to the element becoming visible once, then stop observing
      stop()
    }
  },
)
```

[IntersectionObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver)
