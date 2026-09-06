---
category: Browser
---

# useMediaQuery

Reactive [Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Testing_media_queries) — React port of VueUse's [`useMediaQuery`](https://vueuse.org/core/useMediaQuery/).

**Mapping:** upstream creates a `MediaQueryList` for the query string and returns a reactive
`computed<boolean>` that flips on its `change` event → a `useState(false)`-backed plain boolean + a
self-contained `useEffect` that creates the query, syncs `matches` and subscribes to its `change`
event (removed on unmount). `query` accepts a plain string, a ref-like `{ current }` object or a
getter (upstream `MaybeRefOrGetter`) — re-resolved on every render, the media query re-binds when
the resolved string changes. The initial `matches` sync happens in the mount effect (SSR-safe — the
server renders the `false` default without touching `window`). For SSR, a numeric `ssrWidth` makes
`useMediaQuery` approximate the query from a simulated viewport width while `matchMedia` is
unavailable (mirroring upstream's `ssrSupport` branch), then switch to the real `matchMedia` result
on the client.

## Usage

```tsx
import { useMediaQuery } from '@reaxuse/core'

const isLargeScreen = useMediaQuery('(min-width: 1024px)')
const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)')
```

### Server Side Rendering

If you are using `useMediaQuery` with SSR enabled, specify which screen size you would like to
render on the server and before hydration to avoid a hydration mismatch:

```tsx
const isLarge = useMediaQuery('(min-width: 1024px)', {
  ssrWidth: 768, // Will enable SSR mode and render like if the screen was 768px wide
})

console.log(isLarge) // always false because ssrWidth of 768px is smaller than 1024px
useEffect(() => {
  console.log(isLarge) // false if screen is smaller than 1024px, true if larger than 1024px
}, [isLarge])
```

<DemoContainer name="UseMediaQuery" />

## Type Declarations

```ts
type MaybeRefOrGetter<T> = T | { current: T } | (() => T)

interface ConfigurableWindow {
  window?: Window
}

export function useMediaQuery(
  query: MaybeRefOrGetter<string>,
  options?: ConfigurableWindow & { ssrWidth?: number },
): boolean
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useMediaQuery/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMediaQuery/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMediaQuery/index.browser.test.ts) (tests to mirror),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMediaQuery/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useMediaQuery.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useMediaQuery.ts), docs + demo co-located in `packages/core/useMediaQuery/`

<Contributors name="useMediaQuery" />
