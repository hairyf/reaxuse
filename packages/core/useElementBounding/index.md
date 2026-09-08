---
category: Elements
---

# useElementBounding

Reactive [bounding box](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) of an HTML element

**Mapping:** upstream measures the target with `getBoundingClientRect()` and re-measures on window `scroll`/`resize`, on `style`/`class` mutations (MutationObserver) and on element size changes (ResizeObserver). The React port mirrors the target contract of `useResizeObserver` — a plain element or a React ref. The Vue `ShallowRef`s returned by upstream (`x`, `y`, `top`, `right`, `bottom`, `left`, `width`, `height`) become plain `number` state, so the return is the object `{ x, y, top, right, bottom, left, width, height, update }` — `update()` re-measures on demand. A mount-time effect performs the initial measurement (upstream `tryOnMounted` + `immediate`), and a target-change effect resets the values to `0` when the resolved element becomes detached (upstream `watch(() => unrefElement(target), ...)`), unless `reset: false`. The upstream component (`UseElementBounding`) and directive (`v-element-bounding`) variants are not ported — no React equivalent.

## Usage

```tsx
import { useElementBounding } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement | null>(null)
const { x, y, top, right, bottom, left, width, height } = useElementBounding(el)
```

The bounding box updates as the element is resized, scrolled or restyled:

```tsx
import { useElementBounding } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLTextAreaElement | null>(null)
const { width, height, update } = useElementBounding(el)

// <div>
//   <textarea ref={el} style={{ resize: 'both', overflow: 'hidden' }} />
//   Width: {width}, Height: {height}
//   <button onClick={update}>Re-measure</button>
// </div>
```

Call `update()` to re-measure on demand, e.g. after a synchronous layout change.

<DemoContainer name="UseElementBounding" />

## Type Declarations

The accepted target types are shared with `useResizeObserver` (see
[`useResizeObserver`](./../useResizeObserver/) for `TargetElement`,
`ElementTarget` and `ElementTargetOrArray` — a plain
element, a React ref, or an array of those).

```ts
export interface UseElementBoundingOptions extends ConfigurableWindow {
  /**
   * Reset values to 0 when the element is unmounted / detached.
   * @default true
   */
  reset?: boolean

  /**
   * Listen to window resize event
   * @default true
   */
  windowResize?: boolean

  /**
   * Listen to window scroll event
   * @default true
   */
  windowScroll?: boolean

  /**
   * Immediately call update on component mounted
   * @default true
   */
  immediate?: boolean

  /**
   * Timing to recalculate the bounding box
   * @default 'sync'
   */
  updateTiming?: 'sync' | 'next-frame'
}

export interface UseElementBoundingReturn {
  height: number
  bottom: number
  left: number
  right: number
  top: number
  width: number
  x: number
  y: number
  update: () => void
}

export function useElementBounding(
  target: ElementTarget,
  options?: UseElementBoundingOptions,
): UseElementBoundingReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useElementBounding/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementBounding/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementBounding/index.test.ts) + [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementBounding/index.browser.test.ts) (mirrored in `packages/core/src/useElementBounding.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementBounding/demo.vue) (ported to `demo.tsx` below),
  [`directive.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementBounding/directive.ts) + [`component.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementBounding/component.ts) (directive/component variants — not ported, no React equivalent)
- reaxuse: [`packages/core/src/useElementBounding.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useElementBounding.ts), docs + demo co-located in `packages/core/useElementBounding/`

<Contributors name="useElementBounding" />
