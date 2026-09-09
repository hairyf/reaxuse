---
category: Animation
---

# useTransition

Transition between values

## Usage

```tsx
import { TransitionPresets, useTransition } from '@reaxuse/core'
import { useState } from 'react'

const [source, setSource] = useState(0)
const output = useTransition(source, {
  duration: 1000,
  easing: TransitionPresets.easeInOutCubic,
})

// each `setSource(next)` tweens `output` from its current value to `next`
setSource(100)
```
