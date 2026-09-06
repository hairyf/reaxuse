---
category: Sensors
---

# useScrollLock

Lock scrolling of the element — React port of VueUse's [`useScrollLock`](https://vueuse.org/core/useScrollLock/).

**Mapping:** upstream returns a writable `computed` (`isLocked.value = true/false`) → an
`[isLocked, setIsLocked]` tuple over `useState`, with stable lock/unlock callbacks mutating the
element's inline `overflow` style. The immediate `watch(element, …)` sync becomes an effect keyed on
the resolved element identity (it records the initial overflow, adopts an already-`hidden` element as
locked, and applies `hidden` while locked); `tryOnScopeDispose(unlock)` becomes an unmount cleanup
restoring the initial overflow. The element is accepted as a plain element (or `Window` /
`Document`, resolved to `documentElement`), a ref-like `{ current }` object, or a getter.

## Usage

```tsx
import { useScrollLock } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLDivElement>(null)
const [isLocked, setIsLocked] = useScrollLock(el)

setIsLocked(true) // lock
setIsLocked(false) // unlock
```

<DemoContainer name="UseScrollLock" />

## Type Declarations

```ts
export type ScrollLockElement
  = | HTMLElement
    | SVGElement
    | Window
    | Document
    | null
    | undefined

export type ScrollLockTarget
  = | ScrollLockElement
    | { readonly current?: ScrollLockElement }
    | (() => ScrollLockElement)

export type UseScrollLockReturn = [
  isLocked: boolean,
  setIsLocked: (value: boolean) => void,
]

export function useScrollLock(
  element: ScrollLockTarget,
  initialState?: boolean,
): UseScrollLockReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useScrollLock/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScrollLock/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScrollLock/index.browser.test.ts) (tests mirrored in `packages/core/src/useScrollLock.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScrollLock/demo.vue) (ported to `demo.tsx` below)
- The upstream `directive.ts` variant (`vScrollLock`) is not ported — React has no directive
  equivalent. Upstream's `_resolve-element` helper and the iOS `touchmove` fallback are inlined into
  the single implementation file per the issue mapping.
- reaxuse: [`packages/core/src/useScrollLock.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useScrollLock.ts), docs + demo co-located in `packages/core/useScrollLock/`

<Contributors name="useScrollLock" />
