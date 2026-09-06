---
category: Sensors
---

# useScroll

Reactive scroll position and state — React port of VueUse's [`useScroll`](https://vueuse.org/core/useScroll/).

**Mapping:** upstream returns a writable `computed` for `x` / `y` and `ShallowRef` / `reactive`
objects for the rest → `x`, `y`, `isScrolling`, `arrivedState` and `directions` become plain React
state values that update on re-render (scroll events are batched by React). Programmatic scrolling
(writing `x.value` / `y.value` upstream) is done with the `setX` / `setY` callbacks. The `scroll` /
`scrollend` listeners are registered in a `useEffect` with cleanup (upstream composes
`useEventListener`), the idle reset is a shared `useDebounceFn` and the scroll handler a shared
`useThrottleFn` when `throttle > 0`, and the optional MutationObserver (upstream `useMutationObserver`)
is self-contained in the same effect. `element` accepts an element, a ref-like `{ current }` object or
a getter — the listeners re-bind when the resolved element changes, so a `useRef` target that is
`null` during first render still binds once React attaches it. The upstream `v-scroll` directive is a
Vue feature and is not ported; use the hook inside a `useEffect` for equivalent per-element behavior.

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

<DemoContainer name="UseScroll" />

## Type Declarations

```ts
export type MaybeRefOrGetter<T> = T | { current: T } | (() => T)

export type UseScrollElement = HTMLElement | SVGElement | Window | Document | null | undefined

export interface UseScrollOptions extends ConfigurableWindow {
  throttle?: number
  idle?: number
  offset?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
  observe?: boolean | {
    mutation?: boolean
  }
  onScroll?: (e: Event) => void
  onStop?: (e: Event) => void
  eventListenerOptions?: boolean | AddEventListenerOptions
  behavior?: MaybeRefOrGetter<ScrollBehavior>
  onError?: (error: unknown) => void
}

export interface UseScrollReturn {
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
  measure: () => void
  setX: (x: number) => void
  setY: (y: number) => void
}

export function useScroll(
  element: MaybeRefOrGetter<UseScrollElement>,
  options?: UseScrollOptions,
): UseScrollReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useScroll/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScroll/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScroll/index.test.ts) (mirrored in `packages/core/src/useScroll.test.tsx`),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScroll/index.browser.test.ts) (mirrored in `packages/core/src/useScroll.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScroll/demo.vue) (ported to `demo.tsx` below)
- The upstream `directive.ts` variant (`vScroll`) is a Vue directive and is not ported — React has no
  directive equivalent; use the hook inside an effect instead.
- reaxuse: [`packages/core/src/useScroll.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useScroll.ts), docs + demo co-located in `packages/core/useScroll/`

<Contributors name="useScroll" />
