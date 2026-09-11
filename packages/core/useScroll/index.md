---
category: Sensors
---

# useScroll

Reactive scroll position and state.

## Usage

```tsx
import { useScroll } from '@reause/core'
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

Set the `x` and `y` values to make the element scroll to that position.

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

Set `behavior: smooth` to enable smooth scrolling. The `behavior` option defaults to `auto`, which means no smooth scrolling. See the `behavior` option on [`window.scrollTo()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo) for more information.

```tsx
const { x, y } = useScroll(el, { behavior: 'smooth' })
```

### Recalculate scroll state

You can call the `measure()` method to manually update the scroll position and `arrivedState` at any time.

This is useful, for example, after dynamic content changes or when you want to recalculate the scroll state outside of scroll events.

```tsx
const { measure } = useScroll(el)

// Inside any function
function updateScrollState() {
  // ...some logic
  measure()
}
```

> [!NOTE]
> it's recommended to call `measure()` inside a `useEffect`, to ensure the DOM is updated first.
> The scroll state is initialized automatically on mount.
> You only need to call `measure()` manually if you want to recalculate the state after some dynamic changes.

## Directive Usage

Not ported — upstream ships a `vScroll` directive (Vue, `v-` directive); in React the hook is used directly.
