---
category: Elements
---

# useDraggable

Make elements draggable.

## Usage

```tsx
import { useDraggable } from '@reause/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement>(null)

// `style` will be a helper string for `left: ?px; top: ?px;`
const { x, y, style } = useDraggable(el, {
  initialValue: { x: 40, y: 40 },
})
```

```tsx
// `style` is a helper string for `left: ?px; top: ?px;` — convert it into a
// React style object for the `style` prop (or use `x` / `y` directly)
function styleStringToObject(style: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const declaration of style.split(';')) {
    const [key, value] = declaration.split(':').map(part => part.trim())
    if (key && value)
      result[key] = value
  }
  return result
}

<div ref={el} style={{ position: 'fixed', ...styleStringToObject(style) }}>
  Drag me! I am at
  {' '}
  {x}
  ,
  {' '}
  {y}
</div>
```

### Return Values

| State        | Type       | Description                             |
| ------------ | ---------- | --------------------------------------- |
| `x`          | `number`   | Current x position                      |
| `y`          | `number`   | Current y position                      |
| `position`   | `Position` | Current position object                 |
| `isDragging` | `boolean`  | Whether currently dragging              |
| `style`      | `string`   | CSS style string `left: ?px; top: ?px;` |

### Options

```ts
useDraggable(el, {
  // Initial position (default: { x: 0, y: 0 })
  initialValue: { x: 40, y: 40 },
  // Restrict dragging to specific axis: 'x', 'y', or 'both' (default)
  axis: 'both',
  // Only trigger when clicking directly on the element (default: false)
  exact: false,
  // Prevent default browser behavior (default: false)
  preventDefault: true,
  // Stop event propagation (default: false)
  stopPropagation: false,
  // Use capture phase for events (default: true)
  capture: true,
  // Disable dragging (default: false)
  disabled: false,
  // Mouse buttons that trigger drag (default: [0] - left button)
  buttons: [0],
  // Pointer types to listen to (default: ['mouse', 'touch', 'pen'])
  pointerTypes: ['mouse', 'touch', 'pen'],
  // Custom drag handle element (default: target element)
  handle: handleRef,
  // Container element for bounds (default: none)
  containerElement: containerRef,
  // Element to attach pointermove/pointerup events (default: window)
  draggingElement: window,
  // Callbacks
  onStart: (position, event) => {
    // Return false to prevent dragging
  },
  onMove: (position, event) => {},
  onEnd: (position, event) => {},
})
```

### Prevent Default

Set `preventDefault: true` to override the default drag-and-drop behavior of certain elements in the browser (e.g., images).

```ts
import { useDraggable } from '@reause/core'

const { x, y, style } = useDraggable(el, {
  preventDefault: true,
})
```

### Container Bounds

Use `containerElement` to constrain dragging within a container.

```ts
const { x, y } = useDraggable(el, {
  containerElement: containerRef,
})
```

Set `autoScroll: true` to enable auto-scroll when dragging near the edges.

```ts
const { x, y, style } = useDraggable(el, {
  autoScroll: {
    speed: 2, // Control the speed of auto-scroll.
    margin: 30, // Set the margin from the edge that triggers auto-scroll.
    direction: 'both', // Determine the direction of auto-scroll.
  },
})
```
