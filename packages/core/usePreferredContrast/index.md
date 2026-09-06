---
category: Browser
---

# usePreferredContrast

Reactive [`prefers-contrast`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast)
media query — React port of VueUse's [`usePreferredContrast`](https://vueuse.org/core/usePreferredContrast/).

**Mapping:** upstream composes three `matchMedia` queries — `(prefers-contrast: more)`,
`(prefers-contrast: less)` and `(prefers-contrast: custom)` — through `useMediaQuery` and maps them
with `computed` → three `useState` flags + a single self-contained `useEffect` that creates each
query, syncs `matches` and subscribes to every `change` event (all listeners removed on unmount).
The Vue `computed<ContrastType>` return becomes a plain string — `'more'`, `'less'`, `'custom'` or
`'no-preference'`, resolved in upstream priority order — so components re-render on media query
changes. The initial `matches` sync happens in the mount effect (SSR-safe — the server renders the
`'no-preference'` default without touching `window`).

## Usage

```tsx
import { usePreferredContrast } from '@reaxuse/core'

const contrast = usePreferredContrast() // 'more' | 'less' | 'custom' | 'no-preference'
```

<DemoContainer name="UsePreferredContrast" />

## Type Declarations

```ts
export type ContrastType = 'more' | 'less' | 'custom' | 'no-preference'

interface ConfigurableWindow {
  window?: Window
}

export function usePreferredContrast(options?: ConfigurableWindow): ContrastType
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePreferredContrast/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePreferredContrast/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePreferredContrast/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePreferredContrast.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePreferredContrast.ts), docs + demo co-located in `packages/core/usePreferredContrast/`

<Contributors name="usePreferredContrast" />
