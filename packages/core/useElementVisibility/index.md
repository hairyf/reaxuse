---
category: Elements
---

# useElementVisibility

Tracks the visibility of an element within the viewport — React port of
VueUse's [`useElementVisibility`](https://vueuse.org/core/useElementVisibility/).

**Mapping:** upstream observes the target with an `IntersectionObserver` rooted at the viewport
(or a custom `scrollTarget`) and maps the latest entry's `isIntersecting` onto a reactive boolean.
The reaxuse port returns a plain `boolean` state (the upstream `ShallowRef<boolean>` becomes React
state; the `controls: true` variant is dropped together with the Pausable members
`isActive`/`pause`/`resume`, consistent with this repo's `useIntersectionObserver` contract).
Observation re-uses `useIntersectionObserver`, so target/root/rootMargin re-resolution and observer
teardown follow that hook. When `IntersectionObserver` is unavailable (SSR, older browsers) the hook
falls back to `scroll`/`resize` listeners that recompute the intersection of the target and
viewport (or `scrollTarget`) bounding boxes, honoring `rootMargin` and `threshold`. SSR-safe —
nothing touches `window` during render.

## Usage

```tsx
import { useElementVisibility } from '@reaxuse/core'
import { useRef } from 'react'

const target = useRef<HTMLDivElement | null>(null)
const targetIsVisible = useElementVisibility(target)
```

```tsx
const target2 = useRef<HTMLDivElement | null>(null)
const target2IsVisible = useElementVisibility(target2, {
  threshold: 1.0, // 100% visible
})
```

### rootMargin

If you wish to trigger your callback sooner before the element is fully visible, you can use
the `rootMargin` option (See [MDN IntersectionObserver/rootMargin](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin)).

```ts
const targetIsVisible = useElementVisibility(target, {
  rootMargin: '0px 0px 100px 0px',
})
```

### threshold

If you want to control the percentage of the visibility required to update the value, you can use the `threshold` option (See [MDN IntersectionObserver/threshold](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver#threshold)).

```ts
const targetIsVisible = useElementVisibility(target, {
  threshold: 1.0, // 100% visible
})
```

### once

Stop tracking once the element visibility has changed for the first time:

```ts
const targetIsVisible = useElementVisibility(target, {
  once: true,
})
```

<DemoContainer name="UseElementVisibility" />

## Type Declarations

```ts
interface UseElementVisibilityOptions extends ConfigurableWindow {
  initialValue?: boolean
  scrollTarget?: MaybeComputedElementRef | Document
  threshold?: number | number[]
  rootMargin?: MaybeRefOrGetter<string>
  once?: boolean
}

export function useElementVisibility(
  element: MaybeComputedElementRef,
  options?: UseElementVisibilityOptions,
): boolean
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useElementVisibility/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementVisibility/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementVisibility/index.browser.test.ts) (mirrored as behavioral browser tests),
  [`directive.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementVisibility/directive.test.ts) (directive variant — not ported, no React equivalent),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementVisibility/demo.vue) (ported to `demo.tsx` below; the `controls: true` badge variant is dropped — the React contract is a plain `boolean`),
  [`component.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementVisibility/component.ts) (component variant — not ported, no React equivalent),
  [`directive.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementVisibility/directive.ts) (directive variant — not ported, no React equivalent)
- reaxuse: [`packages/core/src/useElementVisibility.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useElementVisibility.ts), docs + demo co-located in `packages/core/useElementVisibility/`

<Contributors name="useElementVisibility" />
