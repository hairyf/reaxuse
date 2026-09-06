---
category: Browser
---

# usePreferredReducedMotion

Reactive [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
media query — React port of VueUse's [`usePreferredReducedMotion`](https://vueuse.org/core/usePreferredReducedMotion/).

**Mapping:** upstream builds a `matchMedia('(prefers-reduced-motion: reduce)')` query via
`useMediaQuery` and maps the matched ref through `computed` → `useState(false)` + a self-contained
`useEffect` that creates the query, syncs `matches` and subscribes to its `change` event (removed
on unmount). The Vue `computed<ReducedMotionType>` return becomes a plain string —
`'reduce'` or `'no-preference'` — so components re-render on media query changes. The initial
`matches` sync happens in the mount effect (SSR-safe — the server renders the `'no-preference'`
default without touching `window`).

## Usage

```tsx
import { usePreferredReducedMotion } from '@reaxuse/core'

const motion = usePreferredReducedMotion() // 'reduce' | 'no-preference'
```

<DemoContainer name="UsePreferredReducedMotion" />

## Type Declarations

```ts
export type ReducedMotionType = 'reduce' | 'no-preference'

interface ConfigurableWindow {
  window?: Window
}

export function usePreferredReducedMotion(options?: ConfigurableWindow): ReducedMotionType
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/usePreferredReducedMotion/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePreferredReducedMotion/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/usePreferredReducedMotion/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/usePreferredReducedMotion.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/usePreferredReducedMotion.ts), docs + demo co-located in `packages/core/usePreferredReducedMotion/`

<Contributors name="usePreferredReducedMotion" />
