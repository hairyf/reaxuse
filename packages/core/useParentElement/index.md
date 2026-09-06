---
category: Elements
---

# useParentElement

Get parent element of the given element — React port of VueUse's [`useParentElement`](https://vueuse.org/core/useParentElement/).

**Mapping:** upstream returns a read-only `ShallowRef` set on mount and re-set by
`watch(() => toValue(element))` whenever the source element changes → `useState` + a
`useEffect` keyed on the unwrapped element identity. The Vue ref return becomes a plain
value (no `.value`). The source accepts a plain element, a ref-like `{ current }` object
or a getter (upstream: `MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>`).

Divergences:

- Upstream's no-argument form defaults to `useCurrentElement()` (the current component's
  root element). React has no implicit "current component element" — pass an explicit
  element, ref-like object or getter; without one the value stays `undefined`.
- Like upstream's `if (el)` guard, a `null` / `undefined` source keeps the previously
  captured parent instead of resetting it.
- The parent is captured in an effect, so the value stays `undefined` during render and
  on the server (SSR-safe — no DOM access while rendering).
- Mutating a ref-like source's `.current` does not re-render in React — re-render (e.g.
  with your own state) for the new element to be re-captured, mirroring upstream's
  `watch` re-firing on ref change.

## Usage

```tsx
import { useParentElement } from '@reaxuse/core'
import { useRef } from 'react'

const childRef = useRef<HTMLDivElement>(null)
const parent = useParentElement(childRef) // HTMLElement | SVGElement | null | undefined

// with a getter — re-captured whenever it returns a different element
const parentOfChild = useParentElement(() => document.querySelector<HTMLElement>('#child'))
```

<DemoContainer name="UseParentElement" />

## Type Declarations

```ts
export function useParentElement(
  element?: HTMLElement | SVGElement | null | undefined | { current: HTMLElement | SVGElement | null | undefined } | (() => HTMLElement | SVGElement | null | undefined),
): HTMLElement | SVGElement | null | undefined
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useParentElement/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useParentElement/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useParentElement/index.browser.test.ts) (tests mirrored in `packages/core/src/useParentElement.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useParentElement/demo.vue) (adapted to `demo.tsx` below — the upstream demo composes `useMouse` / `useElementByPoint` / `useElementBounding`, which are not ported yet)
- reaxuse: [`packages/core/src/useParentElement.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useParentElement.ts), docs + demo co-located in `packages/core/useParentElement/`

<Contributors name="useParentElement" />
