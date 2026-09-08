---
category: Browser
---

# useBrowserLocation

Reactive browser location — React port of VueUse's [`useBrowserLocation`](https://vueuse.org/core/useBrowserLocation/).

**Mapping:** upstream returns a Vue `Ref<BrowserLocationState>`; here the location is a live React state object returned directly — read URL parts from `location.href`, `location.pathname`, `location.search`, `location.hash`, ... and assign a writable field (e.g. `location.hash = '#top'`) to navigate, which writes through to `window.location` and back (upstream: ref assignment + write-back watcher). The `popstate` / `hashchange` listeners are registered passively in a `useEffect` with cleanup; the initial URL is read once with `trigger: 'load'` and never written back on mount (there is no Vue scheduler flush).

## Usage

```tsx
import { useBrowserLocation } from '@reaxuse/core'

const location = useBrowserLocation()

// read the current URL parts
const { href, pathname, search, hash } = location
console.log(href) // 'https://example.com/path?q=1#anchor'

// navigate by assigning a writable field
location.hash = '#top'
```

> NOTE: If you're using React Router, use the location utilities provided by
> the router instead.

<DemoContainer name="UseBrowserLocation" />

## Type Declarations

```ts
export interface UseBrowserLocationOptions extends ConfigurableWindow {}

export interface BrowserLocationState {
  readonly trigger: string
  readonly state?: any
  readonly length?: number
  readonly origin?: string
  hash?: string
  host?: string
  hostname?: string
  href?: string
  pathname?: string
  port?: string
  protocol?: string
  search?: string
}

export function useBrowserLocation(options?: UseBrowserLocationOptions): BrowserLocationState
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useBrowserLocation/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBrowserLocation/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBrowserLocation/index.test.ts) (mirrored in `packages/core/src/useBrowserLocation.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBrowserLocation/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useBrowserLocation.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useBrowserLocation.ts), docs + demo co-located in `packages/core/useBrowserLocation/`

<Contributors name="useBrowserLocation" />
