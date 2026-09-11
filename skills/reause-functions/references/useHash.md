---
category: Browser
---

# useHash

Shorthand for a reactive `window.location.hash`.

## Usage

```tsx
import { useHash } from '@reause/core'

const [hash, setHash] = useHash()

console.log(hash) // '#foobar'
setHash('foobar') // window.location.hash becomes '#foobar'
```

Pass a default value exposed while the hash is empty, and pick the history mode used when writing it:

```tsx
import { useHash } from '@reause/core'
// ---cut---
const [hash, setHash] = useHash('foobar', { mode: 'push' })
setHash('') // clears the hash, `hash` falls back to 'foobar'
```

## Type Declarations

```ts
export interface UseHashOptions {
  /**
   * How a new hash is written into the browser history.
   *
   * - `'replace'`: `history.replaceState` — overwrites the current history
   *   entry.
   * - `'push'`: `history.pushState` — adds a new entry, so the browser's back
   *   button returns to the previous hash.
   *
   * @default 'replace'
   */
  mode?: "replace" | "push"
}
export type UseHashReturn = [hash: string, setHash: (value: string) => void]
/**
 * Shorthand for a reactive `window.location.hash`.
 *
 * Map from @vueuse/router `useRouteHash`
 * (`source/vueuse/packages/router/useRouteHash/`), which proxies `route.hash`
 * through the router. Here the document hash is the single source of truth, so
 * the router dependency is dropped entirely: the hook reads and writes
 * `window.location` / `history` directly.
 *
 * Return tuple follows this repo's React idiom:
 * `const [hash, setHash] = useHash()` (upstream returns a single writable Vue
 * ref).
 *
 * Hash normalisation:
 *
 * - Reading mirrors upstream's `route.hash || toValue(defaultValue)`: while a
 *   fragment is present the value is `window.location.hash`, which always
 *   keeps its leading `#` (`'#foobar'`). When the fragment is empty
 *   `defaultValue` is exposed verbatim, so `useHash('baz')` exposes `'baz'` —
 *   and `''` when no default was given (upstream exposes `undefined`).
 * - Writing normalises the leading `#`: `setHash('foobar')` writes `#foobar`.
 *   Two adjacent `#` are not collapsed (`setHash('#foobar')` also writes
 *   `#foobar`). The exposed value is then read back from `window.location`, so
 *   any canonicalisation the browser applies (percent-encoding, removal of a
 *   bare `#`) is reflected in the state as well.
 *
 * React divergences from upstream:
 *
 * 1. The `route` / `router` options are gone — `window.location` and `history`
 *    are the driver, and `mode` picks `history.replaceState` (default,
 *    mirroring upstream's `'replace'`) or `history.pushState`.
 * 2. `hash` is React state rather than a `customRef`, so it settles on the
 *    next render after `setHash` instead of upstream's synchronous
 *    `trigger()`; the URL write itself is still synchronous.
 * 3. Neither `replaceState` nor `pushState` fires a `hashchange` event, so the
 *    setter refreshes its own state. `hashchange` (manual edits, anchor
 *    navigation) and `popstate` (back/forward over `mode: 'push'` entries) are
 *    subscribed in an effect and removed on unmount.
 * 4. SSR-safe: render never touches `window` (state starts at
 *    `defaultValue`), the URL is first read in a mount effect, and `setHash`
 *    is a no-op without a `window`.
 * 5. A `defaultValue` that changes across renders is re-synced while the
 *    fragment is empty (the React equivalent of upstream's reactive
 *    `toValue(defaultValue)`).
 *
 * @see https://vueuse.org/router/useRouteHash/
 *
 * @example
 * const [hash, setHash] = useHash()
 * console.log(hash) // '#foobar'
 * setHash('foobar') // window.location.hash becomes '#foobar'
 */
export declare function useHash(
  defaultValue?: string,
  options?: UseHashOptions,
): UseHashReturn
```
