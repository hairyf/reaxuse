---
category: Elements
---

# useResizeObserver

Reports changes to the dimensions of an Element's content or the border-box — React port of
VueUse's [`useResizeObserver`](https://vueuse.org/core/useResizeObserver/).

**Mapping:** upstream observes every resolved target with a platform `ResizeObserver` and tracks
target changes with `watch(computed(() => ...), ..., { immediate: true, flush: 'post' })` → accepted
targets become a plain element, a React ref object (`{ current }`), a getter, or an array of those
(a getter returning an array also works). An effect re-resolves the targets after every render and
re-observes only when the resolved element set or the `window` option actually changed — a
re-render that swaps `target.current` re-observes, while unchanged renders never do (every
`observe()` re-delivers the current sizes). The callback is read through a ref, so changing it does
not re-observe and `stop` stays referentially stable. The upstream
`UseResizeObserverReturn` (`{ isSupported, stop }`) is kept; `isSupported` is plain `boolean` state
that settles in the mount effect (SSR-safe — nothing touches `window` during render).

## Usage

```tsx
import { useResizeObserver } from '@reaxuse/core'
import { useRef, useState } from 'react'

const el = useRef<HTMLTextAreaElement | null>(null)
const [text, setText] = useState('')

useResizeObserver(el, (entries) => {
  const { width, height } = entries[0].contentRect
  setText(`width: ${width}, height: ${height}`)
})
```

<DemoContainer name="UseResizeObserver" />

## Type Declarations

```ts
export interface UseResizeObserverOptions extends ResizeObserverOptions, ConfigurableWindow {}

export interface UseResizeObserverReturn {
  isSupported: boolean
  stop: () => void
}

export type MaybeElement = HTMLElement | SVGElement | undefined | null

export type MaybeComputedElementRef<T extends MaybeElement = MaybeElement>
  = | T
    | { readonly current: T }
    | (() => T)

export type MaybeComputedElementRefOrArray<T extends MaybeElement = MaybeElement>
  = | MaybeComputedElementRef<T>
    | MaybeComputedElementRef<T>[]
    | (() => T[] | null)

export function useResizeObserver(
  target: MaybeComputedElementRefOrArray,
  callback: ResizeObserverCallback,
  options?: UseResizeObserverOptions,
): UseResizeObserverReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useResizeObserver/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useResizeObserver/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useResizeObserver/index.test.ts) (type-level upstream test — mirrored here as behavioral browser tests),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useResizeObserver/demo.vue) (ported to `demo.tsx` below; `disabled` became `readOnly` so the resize handle stays interactive),
  [`directive.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useResizeObserver/directive.ts) (directive variant — not ported, no React equivalent)
- reaxuse: [`packages/core/src/useResizeObserver.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useResizeObserver.ts), docs + demo co-located in `packages/core/useResizeObserver/`

<Contributors name="useResizeObserver" />
