---
category: Browser
---

# usePreferredReducedTransparency

Reactive [`prefers-reduced-transparency`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency)
media query — React port of VueUse's [`usePreferredReducedTransparency`](https://vueuse.org/core/usePreferredReducedTransparency/).

**Mapping:** upstream builds a `matchMedia('(prefers-reduced-transparency: reduce)')` query via
`useMediaQuery` and maps the matched ref through `computed` → `useState(false)` + a self-contained
`useEffect` that creates the query, syncs `matches` and subscribes to its `change` event (removed
on unmount). The Vue `computed<ReducedTransparencyType>` return becomes a plain string —
`'reduce'` or `'no-preference'` — so components re-render on media query changes. The initial
`matches` sync happens in the mount effect (SSR-safe — the server renders the `'no-preference'`
default without touching `window`).

## Usage

```tsx
import { usePreferredReducedTransparency } from '@reaxuse/core'

const transparency = usePreferredReducedTransparency() // 'reduce' | 'no-preference'
```

<DemoContainer name="UsePreferredReducedTransparency" />

## Type Declarations

```ts
export type ReducedTransparencyType = 'reduce' | 'no-preference'

interface ConfigurableWindow {
  window?: Window
}

export function usePreferredReducedTransparency(options?: ConfigurableWindow): ReducedTransparencyType
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePreferredReducedTransparency/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePreferredReducedTransparency/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePreferredReducedTransparency/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePreferredReducedTransparency.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePreferredReducedTransparency.ts), docs + demo co-located in `packages/core/usePreferredReducedTransparency/`

<Contributors name="usePreferredReducedTransparency" />
