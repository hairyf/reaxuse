---
category: Elements
---

# useDraggable

Make elements draggable — React port of VueUse's [`useDraggable`](https://vueuse.org/core/useDraggable/).

**Mapping:** the Vue refs returned by upstream (`x`, `y`, `position`, `isDragging`, `style`) become a
plain object backed by React state — `x` / `y` are numbers, `position` is the `{ x, y }` pair,
`isDragging` a boolean and `style` a ready-to-use CSS string (`left: ?px; top: ?px;`). A
`pointerdown` on the `handle` (default the `target`) starts the drag; `pointermove` / `pointerup` /
`pointercancel` listeners attach to the `draggingElement` (default `window`) in a mount `useEffect`
and are removed on unmount. The `target` / `handle` / `draggingElement` / `containerElement` accept a
plain element, a ref-like `{ current }` object (e.g. the result of `useRef`) or a getter. All options
(`disabled`, `buttons`, `exact`, `axis`, `restrictInView`, `autoScroll`, `onStart` / `onMove` /
`onEnd`, …) are read through a latest-value ref, so the stable listeners always see the newest
options. SSR-safe — nothing touches `window` or the DOM during render.

## Usage

```tsx
import { useDraggable } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement>(null)

// `style` will be a helper string for `left: ?px; top: ?px;`
const { x, y, style } = useDraggable(el, {
  initialValue: { x: 40, y: 40 },
})
```

```tsx
<div ref={el} style={{ position: 'fixed', ...parseStyle(style) }}>
  Drag me! I am at
  {' '}
  {x}
  ,
  {' '}
  {y}
</div>
```

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
import { useDraggable } from '@reaxuse/core'

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

<DemoContainer name="UseDraggable" />

## Type Declarations

```ts
export interface Position {
  x: number
  y: number
}

export type PointerType = 'mouse' | 'touch' | 'pen'

export type DraggableTarget = MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>

export type DraggableElement = MaybeRefOrGetter<HTMLElement | SVGElement | Window | Document | null | undefined>

export type DraggableContainer = MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>

export interface UseDraggableOptions {
  exact?: MaybeRefOrGetter<boolean>
  preventDefault?: MaybeRefOrGetter<boolean>
  stopPropagation?: MaybeRefOrGetter<boolean>
  capture?: boolean
  draggingElement?: DraggableElement
  containerElement?: DraggableContainer
  handle?: DraggableTarget
  pointerTypes?: PointerType[]
  initialValue?: MaybeRefOrGetter<Position>
  onStart?: (position: Position, event: PointerEvent) => void | false
  onMove?: (position: Position, event: PointerEvent) => void
  onEnd?: (position: Position, event: PointerEvent) => void
  axis?: 'x' | 'y' | 'both'
  disabled?: MaybeRefOrGetter<boolean>
  buttons?: MaybeRefOrGetter<number[]>
  restrictInView?: MaybeRefOrGetter<boolean>
  autoScroll?: MaybeRefOrGetter<boolean | {
    speed?: MaybeRefOrGetter<number | Position>
    margin?: MaybeRefOrGetter<number | Position>
    direction?: 'x' | 'y' | 'both'
  }>
}

export interface UseDraggableReturn {
  x: number
  y: number
  position: Position
  isDragging: boolean
  style: string
}

export function useDraggable(
  target: DraggableTarget,
  options?: UseDraggableOptions,
): UseDraggableReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useDraggable/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDraggable/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDraggable/index.test.ts) and
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDraggable/index.browser.test.ts) (mirrored in `packages/core/src/useDraggable.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDraggable/demo.vue) (ported to `demo.tsx` below)
- The upstream `component.ts` variant (`UseDraggable`) is not ported — React has no renderless
  component equivalent.
- reaxuse: [`packages/core/src/useDraggable.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useDraggable.ts), docs + demo co-located in `packages/core/useDraggable/`

<Contributors name="useDraggable" />
