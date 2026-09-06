---
category: Browser
---

# usePreferredDark

Reactive [`prefers-color-scheme: dark`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
media query — React port of VueUse's [`usePreferredDark`](https://vueuse.org/core/usePreferredDark/).

**Mapping:** upstream builds a `matchMedia('(prefers-color-scheme: dark)')` query via `useMediaQuery`
and returns the matched ref → `useState(false)` + a self-contained `useEffect` that creates the
query, syncs `matches` and subscribes to its `change` event (removed on unmount). The Vue
`computed<boolean>` return becomes a plain boolean, so components re-render on media query changes.
The initial `matches` sync happens in the mount effect (SSR-safe — the server renders the `false`
default without touching `window`).

## Usage

```tsx
import { usePreferredDark } from '@reaxuse/core'

const isDark = usePreferredDark() // boolean
// `true` while the user prefers a dark theme, flips live with the OS setting
```

<DemoContainer name="UsePreferredDark" />

## Type Declarations

```ts
interface ConfigurableWindow {
  window?: Window
}

export function usePreferredDark(options?: ConfigurableWindow): boolean
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePreferredDark/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePreferredDark/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePreferredDark/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePreferredDark.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePreferredDark.ts), docs + demo co-located in `packages/core/usePreferredDark/`

<Contributors name="usePreferredDark" />
