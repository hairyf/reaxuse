---
category: Browser
---

# usePreferredLanguages

Reactive Navigator Languages

## Usage

```tsx
import { usePreferredLanguages } from '@reause/core'

const languages = usePreferredLanguages() // readonly string[]
// e.g. ['en-US', 'en'] — re-renders on the window `languagechange` event
```

## Type Declarations

```ts
/**
 * Reactive Navigator Languages.
 *
 * Map from @vueuse/core `usePreferredLanguages`
 * (`source/vueuse/packages/core/usePreferredLanguages/`), which returns a
 * shallow ref of `navigator.languages` kept fresh by a `languagechange`
 * listener. Reactive preferred languages as a plain `readonly string[]`.
 *
 * React divergences:
 * - the Vue `ShallowRef<readonly string[]>` return becomes plain string-array
 *   state, so the component re-renders when the languages change;
 * - the `languagechange` listener lives in a self-contained `useEffect`
 *   (upstream uses `useEventListener`) and is removed on unmount;
 * - the initial `navigator.languages` sync happens in the mount effect
 *   instead of during setup, so SSR renders the upstream `['en']` fallback
 *   without touching `navigator`;
 * - `window` is a read-only option (upstream `ConfigurableWindow`) that
 *   defaults to the global `window` — substitution happens only for
 *   `undefined`, so an explicit `window: null` keeps the hook at the
 *   `['en']` fallback (upstream returns `shallowRef(['en'])` when there is
 *   no window).
 *
 * @see https://vueuse.org/core/usePreferredLanguages/
 * @param options
 *
 * @example
 * const languages = usePreferredLanguages()
 */
export declare function usePreferredLanguages(
  options?: ConfigurableWindow,
): readonly string[]
```
