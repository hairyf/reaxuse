---
category: Sensors
---

# useMouse

Reactive mouse position — React port of VueUse's [`useMouse`](https://vueuse.org/core/useMouse/).

**Mapping:** the Vue shallow refs returned by upstream (`x` / `y` / `sourceType`) become plain
values read directly off the returned object (`x` / `y` are `number` state, `sourceType` is
`'mouse' | 'touch' | null`). The upstream `mousemove` / `dragover` (+ `touchstart` / `touchmove`,
`touchend` when `resetOnTouchEnds` is set) listeners attach in a mount `useEffect` on the `target`
option (default `window`), re-subscribing when the resolved `target`, the `type` mode or the
`touch` / `scroll` / `resetOnTouchEnds` flags change and removing all listeners on unmount
(upstream composes `useEventListener`). The `window` `scroll` listener (only effective on
`type: 'page'`) compensates the page coordinates while scrolling. `target` accepts a plain
element, a ref-like `{ current }` object or a getter; an explicit `null` attaches nothing, exactly
like upstream. SSR-safe — no `window` access during render, so the server renders the defaults.

## Usage

```tsx
import { useMouse } from '@reaxuse/core'

const { x, y, sourceType } = useMouse()
```

Touch is enabled by default. To only detect mouse changes, set `touch` to `false`.
The `dragover` event is used to track mouse position while dragging.

```tsx
const { x, y } = useMouse({ touch: false })
```

<DemoContainer name="UseMouse" />

## Custom Extractor

It's also possible to provide a custom extractor function to get the position from the event.

```tsx
import type { UseMouseEventExtractor } from '@reaxuse/core'
import { useMouse } from '@reaxuse/core'
import { useRef } from 'react'

const parentRef = useRef<HTMLDivElement>(null)

const extractor: UseMouseEventExtractor = event => (
  event instanceof MouseEvent
    ? [event.offsetX, event.offsetY]
    : null
)

const { x, y, sourceType } = useMouse({ target: parentRef, type: extractor })
```

## Type Declarations

```ts
export type UseMouseCoordType = 'page' | 'client' | 'screen' | 'movement'
export type UseMouseSourceType = 'mouse' | 'touch' | null
export type UseMouseEventExtractor = (event: MouseEvent | Touch) => [x: number, y: number] | null | undefined

export interface UseMouseOptions extends ConfigurableWindow {
  /**
   * Mouse position based by page, client, screen, or relative to previous position
   *
   * @default 'page'
   */
  type?: UseMouseCoordType | UseMouseEventExtractor

  /**
   * Listen events on `target` element
   *
   * @default 'Window'
   */
  target?: MaybeRefOrGetter<Window | EventTarget | null | undefined>

  /**
   * Listen to `touchmove` events
   *
   * @default true
   */
  touch?: boolean

  /**
   * Listen to `scroll` events on window, only effective on type `page`
   *
   * @default true
   */
  scroll?: boolean

  /**
   * Reset to initial value when `touchend` event fired
   *
   * @default false
   */
  resetOnTouchEnds?: boolean

  /**
   * Initial values
   */
  initialValue?: {
    x: number
    y: number
  }

  /**
   * Filter for if events should to be received (upstream: `ConfigurableEventFilter`).
   */
  eventFilter?: EventFilter
}

export interface UseMouseReturn {
  x: number
  y: number
  sourceType: UseMouseSourceType
}

export function useMouse(options?: UseMouseOptions): UseMouseReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useMouse/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMouse/index.ts) (implementation),
  [`demo.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMouse/demo.browser.test.ts) (mirrored in `useMouse.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMouse/demo.vue) (ported to `demo.tsx` below)
- The upstream `component.ts` variant (`<UseMouse>`) is a Vue component and is not ported — React has
  no Vue-style renderless components; use the hook directly (as in `demo.tsx`).
- reaxuse: [`packages/core/src/useMouse.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useMouse.ts), docs + demo co-located in `packages/core/useMouse/`

<Contributors name="useMouse" />
