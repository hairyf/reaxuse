---
category: Component
---

# unrefElement

Get the DOM element of a React ref-like object, element or getter — React port of VueUse's [`unrefElement`](https://vueuse.org/core/unrefElement/).

**Mapping:** upstream unwraps a Vue ref or component instance to its underlying DOM element (`plain?.$el ?? plain`). React has no component-instance analog — refs already hold DOM nodes via `{ current }` — so the `$el` unwrap branch (and `VueInstance` in `MaybeElement`) is omitted. The port is a plain, hook-free utility: it resolves a React ref-like object (`{ current }`), a raw element, or a getter (the React analog of upstream's `MaybeComputedElementRef`) through `toValue` and returns the underlying DOM element, leaving `null`/`undefined` inputs unchanged.

## Usage

```tsx
import { unrefElement } from '@reaxuse/core'
import { useEffect, useRef } from 'react'

const div = useRef<HTMLDivElement>(null)

useEffect(() => {
  console.log(unrefElement(div)) // the <div> element (div.current)
})
```

A plain element or a getter works the same way:

```tsx
console.log(unrefElement(div.current)) // the <div> element
console.log(unrefElement(() => div.current)) // the <div> element
```

<DemoContainer name="UnrefElement" />

## Type Declarations

```ts
export type UnRefElementReturn<T extends MaybeElement = MaybeElement> = T | undefined

export function unrefElement<T extends MaybeElement = MaybeElement>(
  elRef: MaybeComputedElementRef<T>,
): UnRefElementReturn<T>
```

`MaybeElement` (`HTMLElement | SVGElement | null | undefined`) and `MaybeComputedElementRef` (an element, a React ref-like object, or a getter) are shared with `useResizeObserver` — see [`useResizeObserver`](./../useResizeObserver/) for their definitions.

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/unrefElement/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/unrefElement/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/unrefElement/index.browser.test.ts) (mirrored by `unrefElement.test.tsx`),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/core/unrefElement/index.md) (upstream docs)
- reaxuse: [`packages/core/src/unrefElement.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/unrefElement.ts), docs + demo co-located in `packages/core/unrefElement/`

<Contributors name="unrefElement" />
