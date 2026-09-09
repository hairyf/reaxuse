---
category: Sensors
---

# useParallax

Create parallax effect easily. It uses `useDeviceOrientation` and fallback to `useMouse` if orientation is not supported.

## Usage

```tsx
import { useParallax } from '@reaxuse/core'
import { useRef } from 'react'

const container = useRef<HTMLDivElement>(null)
const { tilt, roll, source } = useParallax(container)
```

```tsx
<div ref={container} />
```
