---
category: Browser
---

# usePreferredColorScheme

Reactive [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) media query

## Usage

```tsx
import { usePreferredColorScheme } from '@reaxuse/core'

const colorScheme = usePreferredColorScheme() // 'dark' | 'light' | 'no-preference'
```

## Type Declarations

```ts
export type ColorSchemeType = "dark" | "light" | "no-preference"
/**
 * React port of VueUse's `usePreferredColorScheme`.
 *
 * Map from @vueuse/core `usePreferredColorScheme`
 * (`source/vueuse/packages/core/usePreferredColorScheme/`), which composes
 * `useMediaQuery('(prefers-color-scheme: light)')` and
 * `useMediaQuery('(prefers-color-scheme: dark)')` and maps the two matched
 * refs through `computed` to a string. Reactive
 * [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
 * media query as a plain string — `'dark'`, `'light'` or `'no-preference'`.
 *
 * React divergences:
 * - the Vue `computed<ColorSchemeType>` return becomes a plain string
 *   derived from two `useState(false)`-backed booleans (one per query), so
 *   components re-render on media query changes;
 * - both `matchMedia` queries and their `change` listeners attach inside a
 *   self-contained effect (upstream binds through `useMediaQuery` +
 *   `useEventListener`) and are all removed on unmount;
 * - the initial `matches` sync happens in an isomorphic layout effect — on
 *   the client it runs before paint, so the very first frame already carries
 *   the real preference (no `'no-preference'` flash), while SSR renders the
 *   `'no-preference'` default without touching `window` (matching upstream's
 *   initial value, where both media query refs start `false`).
 *
 * @example
 * const colorScheme = usePreferredColorScheme() // 'dark' | 'light' | 'no-preference'
 */
export declare function usePreferredColorScheme(
  options?: ConfigurableWindow,
): ColorSchemeType
```
