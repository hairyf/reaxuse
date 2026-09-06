---
category: Sensors
---

# usePageLeave

Reactive state to show whether the mouse leaves the page — React port of VueUse's [`usePageLeave`](https://vueuse.org/core/usePageLeave/).

**Mapping:** upstream returns a `ShallowRef<boolean>` toggled by `mouseout`/`mouseleave`/`mouseenter`
handlers (`isLeft = !(event.relatedTarget || event.toElement)` — the mouse counts as left when the
event has no related target, i.e. it moved out of the window/document) → `useState(false)` + a
self-contained `useEffect` subscribing to the same three events (passive), removed on unmount. The
Vue ref return becomes a plain boolean; there is no initial sync, so SSR renders the `false` default
without touching `window` (matching upstream's initial value).

## Usage

```tsx
import { usePageLeave } from '@reaxuse/core'

const isLeft = usePageLeave() // boolean
```

<DemoContainer name="UsePageLeave" />

## Type Declarations

```ts
export interface ConfigurableWindow {
  window?: Window
}

export function usePageLeave(options?: ConfigurableWindow): boolean
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePageLeave/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePageLeave/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePageLeave/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePageLeave.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePageLeave.ts), docs + demo co-located in `packages/core/usePageLeave/`

<Contributors name="usePageLeave" />
