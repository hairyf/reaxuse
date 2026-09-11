---
category: Sensors
---

# useMousePressed

Reactive mouse pressing state

## Basic Usage

```tsx
import { useMousePressed } from '@reause/core'

const { pressed, sourceType } = useMousePressed()

// only detect mouse changes
const mouse = useMousePressed({ touch: false })

// only capture presses on a specific element (accepts an element or a React ref)
const el = useRef<HTMLDivElement>(null)
const { pressed } = useMousePressed({ target: el })

// initialValue accepts State<boolean>, including a controllable tuple
const [pressedState, setPressedState] = useState(false)
const controlled = useMousePressed({ initialValue: [pressedState, setPressedState] })
```
