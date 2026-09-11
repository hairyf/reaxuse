---
category: Sensors
---

# usePointer

Reactive pointer state

## Basic Usage

```tsx
import { usePointer } from '@reause/core'

const { x, y, pressure, pointerType, isInside } = usePointer()

// only let `pen` pointers update the state
const pen = usePointer({ pointerTypes: ['pen'] })
```
