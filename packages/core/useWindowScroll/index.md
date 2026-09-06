---
category: Elements
---

# useWindowScroll

Reactive window scroll —
React port of VueUse's [`useWindowScroll`](https://vueuse.org/core/useWindowScroll/).

**Mapping:** upstream delegates to `useScroll(window)`; this port registers the window
`scroll` / `scrollend` listeners (passive) directly in a `useEffect` with cleanup and
resets `isScrolling` with a plain `setTimeout` after `idle` milliseconds. `x`, `y`,
`isScrolling`, `arrivedState` and `directions` are plain React state values that update
on re-render (upstream: refs), and scrolling is done with the stable `setX` / `setY`
callbacks instead of writing to the `x` / `y` refs — React batches the scroll-event
state updates.

## Usage

```tsx
import { useWindowScroll } from '@reaxuse/core'

const { x, y, isScrolling, arrivedState, directions, setX, setY } = useWindowScroll()

// read the current scroll position: x, y
setX(100) // scroll X to 100
setY(100) // scroll Y to 100
```

Scroll with smooth behavior:

```tsx
const { setX, setY } = useWindowScroll({ behavior: 'smooth' })
```

Detect the scroll edges within `offset` pixels (default `30`) and the last movement
direction:

```tsx
const { arrivedState, directions } = useWindowScroll({ offset: { bottom: 100 } })

// load more items when near the bottom
if (arrivedState.bottom)
  console.log('arrived at the bottom')

// scrolling down
if (directions.bottom)
  console.log('scrolling down')
```

<DemoContainer name="UseWindowScroll" />

## Type Declarations

```ts
export interface UseWindowScrollOptions {
  x?: number
  y?: number
  behavior?: ScrollBehavior
  idle?: number
  offset?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
  onError?: (error: unknown) => void
}

export interface UseWindowScrollReturn {
  x: number
  y: number
  isScrolling: boolean
  arrivedState: {
    left: boolean
    right: boolean
    top: boolean
    bottom: boolean
  }
  directions: {
    left: boolean
    right: boolean
    top: boolean
    bottom: boolean
  }
  setX: (x: number) => void
  setY: (y: number) => void
}

export function useWindowScroll(options?: UseWindowScrollOptions): UseWindowScrollReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useWindowScroll/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWindowScroll/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWindowScroll/index.browser.test.ts) (tests mirrored in `packages/core/src/useWindowScroll.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWindowScroll/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useWindowScroll.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useWindowScroll.ts), docs + demo co-located in `packages/core/useWindowScroll/`

<Contributors name="useWindowScroll" />
