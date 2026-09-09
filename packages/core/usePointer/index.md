---
category: Sensors
---

# usePointer

Reactive pointer state

## Usage

```tsx
import { usePointer } from '@reaxuse/core'

const { x, y, pressure, pointerType, isInside } = usePointer()

// only let `pen` pointers update the state
const pen = usePointer({ pointerTypes: ['pen'] })
```
