---
category: Sensors
---

# useElementByPoint

Reactive element by point

## Usage

```tsx
import { useElementByPoint, useMouse } from '@reaxuse/core'

const { x, y } = useMouse({ type: 'client' })
const { element } = useElementByPoint({ x, y })
```

`x` and `y` accept plain numbers, React refs. When `multiple` is
enabled, `element` is an `HTMLElement[]` with every element under the point (`document.elementsFromPoint`):

```tsx
const { element } = useElementByPoint({ x, y, multiple: true })
```
