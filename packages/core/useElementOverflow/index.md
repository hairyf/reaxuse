---
category: Elements
---

# useElementOverflow

Reactive element's overflow state — React port of
VueUse's [`useElementOverflow`](https://vueuse.org/core/useElementOverflow/).

**Mapping:** upstream tracks whether an element's content overflows its box in the x/y
directions by comparing `scrollWidth`/`scrollHeight` against `offsetWidth`/`offsetHeight`
whenever the element or its children resize (`useResizeObserver`) and, with `observeMutation`,
whenever its DOM content mutates (`useMutationObserver`) → the returned object keeps the
upstream member structure `{ isXOverflowed, isYOverflowed, stop, update }`, with the overflow
flags as plain `boolean` state. `target` accepts an element, a React ref object (`{ current }`)
or a getter returning one (SVG elements are ignored). The observers are reconciled in a single
effect: the `ResizeObserver` is rebuilt only when the resolved target + children or the `window`
option changed, the `MutationObserver` whenever `observeMutation` toggles. The Vue
component/directive variants are not ported.

## Usage

```tsx
import { useElementOverflow } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement | null>(null)
const { isXOverflowed } = useElementOverflow(el, { observeMutation: true })

// <div ref={el} style={{ width: 100, overflow: 'hidden' }}>
//   {isXOverflowed ? <button>show more</button> : <span>some words may be too long to show here</span>}
// </div>
```

<DemoContainer name="UseElementOverflow" />

## Type Declarations

```ts
export interface UseElementOverflowOptions extends ConfigurableWindow {
  observeMutation?: boolean | MutationObserverInit
  onUpdated?: ResizeObserverCallback | MutationCallback
}

export interface UseElementOverflowReturn {
  isXOverflowed: boolean
  isYOverflowed: boolean
  stop: () => void
  update: () => void
}

export function useElementOverflow(
  target: MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>,
  option?: UseElementOverflowOptions,
): UseElementOverflowReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useElementOverflow/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementOverflow/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementOverflow/index.browser.test.ts) (upstream tests — mirrored in `packages/core/src/useElementOverflow.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementOverflow/demo.vue) (ported to `demo.tsx` below),
  [`component.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementOverflow/component.ts) (component variant — not ported, no React equivalent),
  [`directive.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementOverflow/directive.ts) (directive variant — not ported, no React equivalent),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementOverflow/index.md) (upstream docs)
- reaxuse: [`packages/core/src/useElementOverflow.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useElementOverflow.ts), docs + demo co-located in `packages/core/useElementOverflow/`

<Contributors name="useElementOverflow" />
