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

## Source Forms

`x` and `y` are read-only value sources and take plain numbers (upstream:
`MaybeRefOrGetter<number>`). Resolve a React ref or state value at the call site; `multiple` stays a
plain value / React ref (a behavior toggle):

```tsx
const { x, y } = useMouse({ type: 'client' })

const { element } = useElementByPoint({ x, y }) // read on every scheduler tick
const { element: refElement } = useElementByPoint({ x: xRef.current, y: yRef.current })
```
