---
category: Browser
---

# useBrowserLocation

Reactive browser location

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
/**
 * Reactive browser location.
 *
 * Map from @vueuse/core `useBrowserLocation`
 * (`source/vueuse/packages/core/useBrowserLocation/`). Mirrors the current
 * `window.location` as a live object — read URL parts from `href`, `pathname`,
 * `search`, `hash`, ... and navigate by assigning a writable field. The object
 * refreshes from the URL on `popstate` / `hashchange` events and updates
 * synchronously when a writable field is assigned (initial value
 * `trigger: 'load'`).
 *
 * React divergences from upstream:
 *
 * 1. The Vue `Ref<BrowserLocationState>` return becomes a plain state object
 *    returned directly — read `location.href`, `location.pathname`, ... like
 *    upstream's `state.value.*`.
 * 2. Writable refs → writable accessors: assigning a writable field (e.g.
 *    `location.hash = '#top'`) writes the value back into the returned snapshot
 *    and through to `window.location[key]`, exactly like upstream's ref
 *    write-back watcher (the URL write is a no-op when the value is unchanged),
 *    so the assigned field reads back the written value synchronously without
 *    waiting for the next event. Read-only members (`trigger`, `state`,
 *    `length`, `origin`) are getter-only.
 * 3. The `popstate` / `hashchange` listeners (passive, matching upstream) are
 *    registered in a `useEffect` with cleanup and refresh the snapshot from the
 *    URL. There is no Vue scheduler flush — apart from setters the state only
 *    changes from those events, so plain initialization never writes anything
 *    back to the URL.
 *
 * @example
 * const location = useBrowserLocation()
 *
 * location.hash = '#top' // navigate: URL hash becomes `#top`
 * console.log(location.href)
 */
export declare function useBrowserLocation(
  options?: UseBrowserLocationOptions,
): BrowserLocationState
```
