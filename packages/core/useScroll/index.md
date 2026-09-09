---
category: Sensors
---

# useScroll

Reactive scroll position and state

## Usage

```tsx
import { useScroll } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement>(null)
const { x, y, isScrolling, arrivedState, directions } = useScroll(el)
```

### With offsets

```tsx
const { x, y, isScrolling, arrivedState, directions } = useScroll(el, {
  offset: { top: 30, bottom: 30, right: 30, left: 30 },
})
```

### Setting scroll position

Use the `setX` / `setY` callbacks to make the element scroll to that position
(upstream assigns `x` / `y`, which are state here):

```tsx
const el = useRef<HTMLDivElement>(null)
const { x, y, setX, setY } = useScroll(el)
```

```tsx
<>
  <button onClick={() => setX(x + 10)}>Scroll right 10px</button>
  <button onClick={() => setY(y + 10)}>Scroll down 10px</button>
</>
```

### Smooth scrolling

Set `behavior: 'smooth'` to enable smooth scrolling. The `behavior` option defaults to `auto`,
which means no smooth scrolling. See the `behavior` option on
[`window.scrollTo()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo) for more
information.

```tsx
const { x, y } = useScroll(el, { behavior: 'smooth' })
```

### Recalculate scroll state

Call the `measure()` method to manually update the scroll position and `arrivedState` at any time.
This is useful, for example, after dynamic content changes or when you want to recalculate the scroll
state outside of scroll events. It is recommended to call `measure()` after the DOM has updated
(e.g. in a `useEffect`). The scroll state is initialized automatically on mount; you only need
`measure()` if you want to recalculate after dynamic changes.

```tsx
useEffect(() => {
  measure()
}, [someReactiveValue])
```
