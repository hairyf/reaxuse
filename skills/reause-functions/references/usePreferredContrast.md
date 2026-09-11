---
category: Browser
---

# usePreferredContrast

Reactive [`prefers-contrast`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast) media query

## Usage

```tsx
import { usePreferredContrast } from '@reause/core'

const contrast = usePreferredContrast() // 'more' | 'less' | 'custom' | 'no-preference'
```

## Type Declarations

```ts
export type ContrastType = "more" | "less" | "custom" | "no-preference"
/**
 * React port of VueUse's `usePreferredContrast`.
 *
 * Map from @vueuse/core `usePreferredContrast`
 * (`source/vueuse/packages/core/usePreferredContrast/`), which composes
 * three `useMediaQuery` queries — `(prefers-contrast: more)`,
 * `(prefers-contrast: less)` and `(prefers-contrast: custom)` — and maps
 * them through `computed` to a `ContrastType` string. Reactive
 * [prefers-contrast](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast)
 * media query as a plain string — `'more'`, `'less'`, `'custom'` or
 * `'no-preference'`.
 *
 * React divergences:
 * - the Vue `computed<ContrastType>` return becomes a plain string derived
 *   from three `useState` flags, so components re-render on media query
 *   changes;
 * - the three `matchMedia` queries and their `change` listeners attach
 *   inside a single self-contained `useEffect` (upstream binds each query
 *   through `useMediaQuery` + `useEventListener` with `{ passive: true }`)
 *   and all of them are removed on unmount;
 * - the initial `matchMedia().matches` sync happens in the mount effect
 *   instead of during setup, so SSR renders the `'no-preference'` default
 *   without touching `window` (matching upstream's initial value, where the
 *   media query refs start `false`).
 *
 * @example
 * const contrast = usePreferredContrast()
 */
export declare function usePreferredContrast(
  options?: ConfigurableWindow,
): ContrastType
```
