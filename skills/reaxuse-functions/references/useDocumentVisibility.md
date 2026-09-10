---
category: Elements
---

# useDocumentVisibility

Reactively track [`document.visibilityState`](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState)

## Usage

```tsx
import { useDocumentVisibility } from '@reaxuse/core'

const visibility = useDocumentVisibility() // 'visible' | 'hidden'
```

## Type Declarations

```ts
export interface UseDocumentVisibilityOptions {
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in
   * testing environments. Inlined here — `ConfigurableDocument` is not ported
   * to `@reaxuse/shared`, so `document?` mirrors the option `useFileDialog`
   * exposes (defaults to the global `document` when not provided).
   *
   * @default typeof document !== 'undefined' ? document : undefined
   */
  document?: Document | null
}
/**
 * React port of VueUse's `useDocumentVisibility`.
 *
 * Map from @vueuse/core `useDocumentVisibility`
 * (`source/vueuse/packages/core/useDocumentVisibility/`). Reactively track
 * `document.visibilityState` — `'visible'` or `'hidden'` — by subscribing to
 * the document `visibilitychange` event.
 *
 * React divergences:
 * - the Vue `ShallowRef<DocumentVisibilityState>` return becomes a plain
 *   `DocumentVisibilityState` value;
 * - the `visibilitychange` listener lives in a self-contained `useEffect`
 *   (upstream composes `useEventListener`) and is removed on unmount;
 * - the initial `document.visibilityState` read happens in the mount effect
 *   instead of during setup, so SSR renders the `'visible'` default without
 *   touching `document` (matching upstream's no-document value).
 *
 * @example
 * const visibility = useDocumentVisibility()
 */
export declare function useDocumentVisibility(
  options?: UseDocumentVisibilityOptions,
): DocumentVisibilityState
```
