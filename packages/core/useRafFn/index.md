---
category: Animation
---

# useRafFn

Call function on every `requestAnimationFrame`

## Usage

```tsx
import { useRafFn } from '@reaxuse/core'
import { useState } from 'react'

const [count, setCount] = useState(0)

const { pause, resume } = useRafFn(() => {
  setCount(c => c + 1)
  console.log(count)
})
```
