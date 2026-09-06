---
category: Elements
---

# useWindowFocus

Reactive window focus state — React port of VueUse's [`useWindowFocus`](https://vueuse.org/core/useWindowFocus/).

**Mapping:** upstream returns a `ShallowRef<boolean>` seeded with `window.document.hasFocus()` and
subscribes via `useEventListener` → `useState(false)` + a self-contained `useEffect` subscribing to
the window `focus`/`blur` events (passive), removed on unmount. The Vue ref return becomes a plain
boolean; the initial `hasFocus()` sync happens in the mount effect (SSR-safe — the server renders
the `false` default without touching `window.document`, matching upstream's no-window value).

## Usage

```tsx
import { useWindowFocus } from '@reaxuse/core'

const focused = useWindowFocus() // boolean
```

<DemoContainer name="UseWindowFocus" />

## Type Declarations

```ts
export interface ConfigurableWindow {
  window?: Window
}

export function useWindowFocus(options?: ConfigurableWindow): boolean
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useWindowFocus/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWindowFocus/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWindowFocus/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useWindowFocus.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useWindowFocus.ts), docs + demo co-located in `packages/core/useWindowFocus/`

<Contributors name="useWindowFocus" />
