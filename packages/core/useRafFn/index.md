---
category: Animation
---

# useRafFn

Call function on every `requestAnimationFrame`. With controls of pausing and resuming.

## Usage

```tsx
import { useRafFn } from '@reaxuse/core'
import { useState } from 'react'

const [count, setCount] = useState(0)

const { pause, resume } = useRafFn(() => {
  setCount(c => c + 1)
  console.log(count + 1)
})
```
