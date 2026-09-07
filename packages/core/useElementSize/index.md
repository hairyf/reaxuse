---
category: Elements
---

# useElementSize

Reactive size of an HTML element. [ResizeObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)

**Mapping:** upstream observes the target element with a platform `ResizeObserver` and reports the
size of the box selected by the `box` option (`border-box`, `content-box` or
`device-pixel-content-box`), falling back to `getBoundingClientRect` for SVG elements and to
`contentRect` when the box sizes are unavailable. The React port mirrors `useResizeObserver`'s
target contract — a plain element, a React ref object (`{ current }`), or a getter. `width`/`height`
are plain `number` state (upstream: `ShallowRef`s), so the return is the object `{ width, height,
stop }`. A mount-time prefill reads `offsetWidth`/`offsetHeight` (padding/border subtracted for
`content-box`) so the size is correct before the first async observer delivery, and a
target-change reset mirrors upstream's `watch(() => unrefElement(target), ...)`. The upstream
component (`UseElementSize`) and directive (`v-element-size`) variants are not ported — no React
equivalent.

## Usage

```tsx
import { useElementSize } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLTextAreaElement | null>(null)
const { width, height, stop } = useElementSize(el)
```

The element's size updates as it is resized:

```tsx
import { useElementSize } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement | null>(null)
const { width, height } = useElementSize(el, { width: 0, height: 0 }, { box: 'border-box' })

// <div ref={el} style={{ resize: 'both', overflow: 'auto' }}>
//   Width: {width}, Height: {height}
// </div>
```

The observer is disconnected automatically on unmount. Call `stop()` to disconnect earlier.

<DemoContainer name="UseElementSize" />

## Type Declarations

The accepted target types are shared with `useResizeObserver` (see
[`useResizeObserver`](./../useResizeObserver/) for `MaybeElement`,
`MaybeComputedElementRef` and `MaybeComputedElementRefOrArray` — a plain
element, a React ref object (`{ current }`), a getter, or an array of those).

```ts
export interface ElementSize {
  width: number
  height: number
}

export interface UseElementSizeOptions extends UseResizeObserverOptions {}

export interface UseElementSizeReturn {
  width: number
  height: number
  stop: () => void
}

export function useElementSize(
  target: MaybeComputedElementRef,
  initialSize?: ElementSize,
  options?: UseElementSizeOptions,
): UseElementSizeReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useElementSize/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementSize/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementSize/index.browser.test.ts) (mirrored as behavioral browser tests),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementSize/demo.vue) (ported to `demo.tsx` below),
  [`directive.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementSize/directive.ts) + [`directive.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementSize/directive.browser.test.ts) (directive variant — not ported, no React equivalent),
  [`component.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementSize/component.ts) (component variant — not ported, no React equivalent)
- reaxuse: [`packages/core/src/useElementSize.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useElementSize.ts), docs + demo co-located in `packages/core/useElementSize/`

<Contributors name="useElementSize" />
