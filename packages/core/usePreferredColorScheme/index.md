---
category: Browser
---

# usePreferredColorScheme

Reactive [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
media query — React port of VueUse's [`usePreferredColorScheme`](https://vueuse.org/core/usePreferredColorScheme/).

**Mapping:** upstream composes two `useMediaQuery` queries — `(prefers-color-scheme: light)` and
`(prefers-color-scheme: dark)` — and maps the matched refs through `computed` → two `useState(false)`
booleans + a self-contained `useEffect` that creates both queries, syncs their `matches` and subscribes
to both `change` events (all removed on unmount). The Vue `computed<ColorSchemeType>` return becomes a
plain string — `'dark'`, `'light'` or `'no-preference'` — so components re-render on media query
changes. Dark wins when both queries report a match (mirroring upstream's check order). The initial
`matches` sync happens in the mount effect (SSR-safe — the server renders the `'no-preference'`
default without touching `window`).

## Usage

```tsx
import { usePreferredColorScheme } from '@reaxuse/core'

const colorScheme = usePreferredColorScheme() // 'dark' | 'light' | 'no-preference'
```

<DemoContainer name="UsePreferredColorScheme" />

## Type Declarations

```ts
export type ColorSchemeType = 'dark' | 'light' | 'no-preference'

interface ConfigurableWindow {
  window?: Window
}

export function usePreferredColorScheme(options?: ConfigurableWindow): ColorSchemeType
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePreferredColorScheme/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePreferredColorScheme/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePreferredColorScheme/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePreferredColorScheme.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePreferredColorScheme.ts), docs + demo co-located in `packages/core/usePreferredColorScheme/`

<Contributors name="usePreferredColorScheme" />
