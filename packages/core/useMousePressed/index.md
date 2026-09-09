---
category: Sensors
---

# useMousePressed

Reactive mouse pressing state

## Usage

```tsx
import { useMousePressed } from '@reaxuse/core'

const { pressed, sourceType } = useMousePressed()

// only detect mouse changes
const mouse = useMousePressed({ touch: false })

// only capture presses on a specific element (accepts an element or a React ref)
const el = useRef<HTMLDivElement>(null)
const { pressed } = useMousePressed({ target: el })
```
