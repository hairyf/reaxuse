---
category: Sensors
---

# useOnline

Reactive online state — React port of VueUse's [`useOnline`](https://vueuse.org/core/useOnline/).

**Mapping:** upstream composes `useNetwork` and returns its `isOnline` ref → `useState(true)` + a
self-contained `useEffect` subscribing to the window `online`/`offline` events, removed on unmount.
The Vue ref return becomes a plain boolean; the initial `navigator.onLine` sync happens in the
mount effect (SSR-safe — the server renders the `true` default without touching `navigator`).

## Usage

```tsx
import { useOnline } from '@reaxuse/core'

const online = useOnline() // boolean
```

<DemoContainer name="UseOnline" />

## Type Declarations

```ts
export interface ConfigurableWindow {
  window?: Window
}

export function useOnline(options?: ConfigurableWindow): boolean
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useOnline/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useOnline/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useOnline/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useOnline.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useOnline.ts), docs + demo co-located in `packages/core/useOnline/`

<Contributors name="useOnline" />
