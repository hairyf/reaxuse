---
category: Browser
---

# useScreenSafeArea

Reactive `env(safe-area-inset-*)`

![image](https://webkit.org/wp-content/uploads/safe-areas-1.png)

## Usage

In order to make the page to be fully rendered in the screen, the additional attribute
`viewport-fit=cover` within `viewport` meta tag must be set firstly, the viewport meta tag may look
like this:

```html
<meta name="viewport" content="initial-scale=1, viewport-fit=cover" />
```

Then we could use `useScreenSafeArea` in the component as shown below:

```tsx
import { useScreenSafeArea } from '@reause/core'

const {
  top,
  right,
  bottom,
  left,
  update,
} = useScreenSafeArea()
```

For further details, you may refer to this documentation: [Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

## Type Declarations

```ts
export interface UseScreenSafeAreaReturn {
  top: string
  right: string
  bottom: string
  left: string
  update: () => void
}
/**
 * React port of VueUse's `useScreenSafeArea`.
 *
 * Map from @vueuse/core `useScreenSafeArea`
 * (`source/vueuse/packages/core/useScreenSafeArea/`), which writes the
 * `--vueuse-safe-area-*` custom properties with `env(safe-area-inset-*, 0px)`
 * fallbacks onto `document.documentElement` (via `useCssVar`), reads their
 * computed values back through `getComputedStyle(...).getPropertyValue(...)`
 * and re-reads on a debounced passive `resize` listener (via
 * `useEventListener` + `useDebounceFn`).
 *
 * React divergences:
 * - the four `shallowRef` string values become a single state object
 *   `{ top, right, bottom, left }` (computed style strings, e.g. `0px`)
 *   plus a stable `update()` callback;
 * - the custom-property setup and the 200ms-debounced passive `resize`
 *   listener live in one self-contained mount `useEffect` (upstream composes
 *   `useCssVar` / `useEventListener` / `useDebounceFn`, which are not ported
 *   here) and the listener is removed on unmount;
 * - SSR-safe: nothing touches the DOM during render — the state stays `''`
 *   on the server, the custom properties are set and first-read in the mount
 *   effect, and `update` is a no-op without `document` (upstream guards only
 *   the setup with `isClient`).
 *
 * @example
 * const { top, right, bottom, left, update } = useScreenSafeArea()
 */
export declare function useScreenSafeArea(): UseScreenSafeAreaReturn
```
