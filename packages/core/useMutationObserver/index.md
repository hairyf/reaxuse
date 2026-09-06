---
category: Elements
---

# useMutationObserver

Watch for changes being made to the DOM tree — React port of
VueUse's [`useMutationObserver`](https://vueuse.org/core/useMutationObserver/).
[MutationObserver MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)

**Mapping:** upstream wraps a platform `MutationObserver`, observes every resolved target and tracks
target changes with `watch(computed(() => ...), ..., { immediate: true, flush: 'post' })` → accepted
targets become a plain element, a React ref object (`{ current }`), a getter, an array of those, or a
ref/getter holding an array. An effect re-resolves the targets after every render and re-observes only
when the resolved element set or the `window` option actually changed. The callback is read through a
ref, so changing it does not re-observe and `stop` stays referentially stable. The upstream
`UseMutationObserverReturn` (`{ isSupported, stop, takeRecords }`) is kept; `isSupported` is plain
`boolean` state that settles in the mount effect (SSR-safe — nothing touches `window` during render).

## Usage

```tsx
import { useMutationObserver } from '@reaxuse/core'
import { useRef, useState } from 'react'

const el = useRef<HTMLDivElement | null>(null)
const [messages, setMessages] = useState<string[]>([])

useMutationObserver(el, (mutations) => {
  if (mutations[0])
    setMessages(prev => [...prev, mutations[0].attributeName!])
}, {
  attributes: true,
})
```

<DemoContainer name="UseMutationObserver" />

## Type Declarations

```ts
export interface UseMutationObserverOptions extends MutationObserverInit, ConfigurableWindow {}

export interface UseMutationObserverReturn {
  isSupported: boolean
  stop: () => void
  takeRecords: () => MutationRecord[] | undefined
}

export type MaybeElement = HTMLElement | SVGElement | undefined | null

export type MaybeComputedElementRef<T extends MaybeElement = MaybeElement>
  = | T
    | { readonly current: T }
    | (() => T)

export type MaybeComputedElementRefOrArray<T extends MaybeElement = MaybeElement>
  = | MaybeComputedElementRef<T>
    | MaybeComputedElementRef<T>[]
    | MaybeRefOrGetter<T[] | null>

export function useMutationObserver(
  target: MaybeComputedElementRefOrArray,
  callback: MutationCallback,
  options?: UseMutationObserverOptions,
): UseMutationObserverReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useMutationObserver/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMutationObserver/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMutationObserver/index.browser.test.ts) (upstream tests — mirrored in `packages/core/src/useMutationObserver.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMutationObserver/demo.vue) (ported to `demo.tsx` below),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMutationObserver/index.md) (upstream docs)
- reaxuse: [`packages/core/src/useMutationObserver.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useMutationObserver.ts), docs + demo co-located in `packages/core/useMutationObserver/`

<Contributors name="useMutationObserver" />
