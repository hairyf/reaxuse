---
category: Elements
---

# useIntersectionObserver

Detects changes to a target element's visibility — React port of
VueUse's [`useIntersectionObserver`](https://vueuse.org/core/useIntersectionObserver/).

**Mapping:** upstream observes every resolved target with a platform `IntersectionObserver` and
rebuilds it via `watch(...)` whenever the resolved targets, root, root margin or active state
change → accepted targets become a plain element, a React ref object (`{ current }`), a getter, or
an array of those (a ref-like or getter holding an array of elements also works, e.g. a ref bound
to a list). An effect re-resolves the targets/root/rootMargin after every render and re-observes
only when something actually changed — a re-render that swaps `target.current` re-observes, while
unchanged renders never recreate the observer. The callback is read through a ref, so changing it
does not re-observe and `stop` stays referentially stable. The upstream Pausable members
(`isActive`/`pause`/`resume`) are dropped — the React contract mirrors `useResizeObserver`:
`{ isSupported, stop }`. `isSupported` is plain `boolean` state that settles in the mount effect
(SSR-safe — nothing touches `window` during render).

## Usage

```tsx
import { useIntersectionObserver } from '@reaxuse/core'
import { useRef, useState } from 'react'

const target = useRef<HTMLDivElement | null>(null)
const [targetIsVisible, setIsVisible] = useState(false)

const { stop } = useIntersectionObserver(
  target,
  ([entry]) => {
    setIsVisible(entry?.isIntersecting || false)
  },
)
```

The observer is disconnected automatically on unmount, so in most cases you don't need to call
`stop` yourself. Call `stop()` to disconnect the observer earlier, for example once the element has
become visible:

```ts
const { stop } = useIntersectionObserver(
  target,
  ([entry]) => {
    if (entry?.isIntersecting) {
      // react to the element becoming visible once, then stop observing
      stop()
    }
  },
)
```

<DemoContainer name="UseIntersectionObserver" />

## Type Declarations

The accepted target types are shared with `useResizeObserver` (see
[`useResizeObserver`](./../useResizeObserver/) for `MaybeElement`,
`MaybeComputedElementRef` and `MaybeComputedElementRefOrArray` — a plain
element, a React ref object (`{ current }`), a getter, or an array of those).

```ts
export interface UseIntersectionObserverOptions extends ConfigurableWindow {
  immediate?: boolean
  root?: MaybeComputedElementRef | Document
  rootMargin?: MaybeRefOrGetter<string>
  threshold?: number | number[]
}

export interface UseIntersectionObserverReturn {
  isSupported: boolean
  stop: () => void
}

export function useIntersectionObserver(
  target: MaybeComputedElementRefOrArray,
  callback: IntersectionObserverCallback,
  options?: UseIntersectionObserverOptions,
): UseIntersectionObserverReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useIntersectionObserver/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useIntersectionObserver/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useIntersectionObserver/index.browser.test.ts) (mirrored as behavioral browser tests),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useIntersectionObserver/demo.vue) (ported to `demo.tsx` below; the Pausable enable toggle is dropped — the React contract is `{ isSupported, stop }`),
  [`directive.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useIntersectionObserver/directive.ts) (directive variant — not ported, no React equivalent)
- reaxuse: [`packages/core/src/useIntersectionObserver.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useIntersectionObserver.ts), docs + demo co-located in `packages/core/useIntersectionObserver/`

<Contributors name="useIntersectionObserver" />
