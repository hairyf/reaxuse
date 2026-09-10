---
category: Browser
---

# useFavicon

Reactive favicon

## Usage

```tsx
import { useFavicon } from '@reaxuse/core'

const [icon, setIcon] = useFavicon()

setIcon('dark.png') // change current icon
```

### Passing a source ref

`newIcon` is a read-only value source and takes a plain `string | null | undefined` (upstream:
`MaybeRef<string | null | undefined>`). Resolve a React ref at the call site; the returned setter
owns the state from mount on, so a new argument is not adopted afterwards:

```tsx
const [icon, setIcon] = useFavicon('dark.png')

setIcon('light.png') // change the favicon
const [refIcon] = useFavicon(iconRef.current) // resolve a React ref at the call site
```

## Type Declarations

```ts
export interface UseFaviconOptions {
  /**
   * The base URL to prepend to the favicon path.
   *
   * @default ''
   */
  baseUrl?: string
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in
   * testing environments. Inlined here — `ConfigurableDocument` is not ported
   * to `@reaxuse/shared`, so `document?` mirrors the option `useTitle` exposes
   * (defaults to the global `document` when not provided).
   */
  document?: Document | null
  /**
   * The `<link>` `rel` attribute to manage.
   *
   * @default 'icon'
   */
  rel?: string
}
export type UseFaviconReturn = [
  icon: string | null | undefined,
  setIcon: Dispatch<SetStateAction<string | null | undefined>>,
]
/**
 * React port of VueUse's `useFavicon`.
 *
 * Map from @vueuse/core `useFavicon`
 * (`source/vueuse/packages/core/useFavicon/`). Reactive favicon: keeps the
 * current favicon URL in component state and writes it back to the
 * `<link rel="icon">` element(s) in the document `<head>` on change
 * (creating one when none exists).
 *
 * Return tuple follows this repo's React idiom:
 * `const [icon, setIcon] = useFavicon()` (upstream returns a single Vue ref —
 * a readonly `ComputedRef` when the source is a ref).
 *
 * React divergences:
 * - upstream adopts the value at setup and applies it synchronously via a
 *   `watch(..., { immediate: true })`; React must not touch the DOM during
 *   render (SSR-safe), so the DOM write happens in an effect — the initial
 *   icon is applied on mount instead;
 * - the icon write is a `useEffect` on the state instead of a Vue watcher;
 * - `newIcon` is a read-only value source and takes a plain
 *   `string | null | undefined` (upstream: `MaybeRef<string | null |
 *   undefined>`; resolve a React ref at the call site). The returned setter
 *   owns the state from mount on — the argument is only the initial value,
 *   so the setter stays authoritative (upstream returns the very ref it was
 *   given and can therefore be written through);
 * - setting `null`/`undefined` through the setter updates the state but
 *   leaves the existing `<link>` untouched (upstream would leave it stale
 *   too, since the watcher only applies string values).
 *
 * It's not SSR compatible: your value will be applied only on client-side.
 *
 * @example
 * const [icon, setIcon] = useFavicon('dark.png')
 * console.log(icon) // print current icon
 * setIcon('light.png') // change current icon
 */
export declare function useFavicon(
  newIcon?: string | null | undefined,
  options?: UseFaviconOptions,
): UseFaviconReturn
```
