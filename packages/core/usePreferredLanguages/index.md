---
category: Browser
---

# usePreferredLanguages

Reactive Navigator Languages — React port of VueUse's
[`usePreferredLanguages`](https://vueuse.org/core/usePreferredLanguages/).

**Mapping:** `shallowRef(navigator.languages)` + `useEventListener(window, 'languagechange', ...)`
→ `useState(['en'])` + a self-contained `useEffect` re-syncing `navigator.languages` on the window
`languagechange` event, removed on unmount. The Vue `ShallowRef<readonly string[]>` return becomes a
plain `readonly string[]`; the initial sync happens in the mount effect (SSR-safe — the server
renders the upstream `['en']` fallback without touching `navigator`).

## Usage

```tsx
import { usePreferredLanguages } from '@reaxuse/core'

const languages = usePreferredLanguages() // readonly string[]
// e.g. ['en-US', 'en'] — re-renders on the window `languagechange` event
```

<DemoContainer name="UsePreferredLanguages" />

## Type Declarations

```ts
interface ConfigurableWindow {
  window?: Window
}

export function usePreferredLanguages(options?: ConfigurableWindow): readonly string[]
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePreferredLanguages/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePreferredLanguages/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePreferredLanguages/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePreferredLanguages.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePreferredLanguages.ts), docs + demo co-located in `packages/core/usePreferredLanguages/`

<Contributors name="usePreferredLanguages" />
