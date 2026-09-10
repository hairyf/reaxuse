---
category: Browser
---

# usePreferredReducedMotion

Reactive [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) media query

## Usage

```tsx
import { usePreferredReducedMotion } from '@reaxuse/core'

const motion = usePreferredReducedMotion() // 'reduce' | 'no-preference'
```

## Type Declarations

```ts
export type ReducedMotionType = "reduce" | "no-preference"
/**
 * React port of VueUse's `usePreferredReducedMotion`.
 *
 * Map from @vueuse/core `usePreferredReducedMotion`
 * (`source/vueuse/packages/core/usePreferredReducedMotion/`), which composes
 * `useMediaQuery('(prefers-reduced-motion: reduce)')` and maps the matched
 * boolean to a string. Reactive
 * [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
 * media query as a plain string — `'reduce'` or `'no-preference'`.
 *
 * React divergences:
 * - the Vue `computed<ReducedMotionType>` return becomes a plain string
 *   derived from `useMediaQuery`, so components re-render on media query
 *   changes;
 * - media query binding is delegated to `useMediaQuery` (as upstream does),
 *   which attaches the query and its `change` listener inside a
 *   self-contained `useEffect` and removes them on unmount;
 * - the initial `matchMedia().matches` sync happens in `useMediaQuery`'s
 *   mount effect instead of during setup, so SSR renders the
 *   `'no-preference'` default without touching `window` (matching
 *   upstream's initial value, where the media query ref starts `false`).
 *
 * @example
 * const motion = usePreferredReducedMotion()
 */
export declare function usePreferredReducedMotion(
  options?: ConfigurableWindow,
): ReducedMotionType
```
