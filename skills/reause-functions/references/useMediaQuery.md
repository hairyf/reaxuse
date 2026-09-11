---
category: Browser
---

# useMediaQuery

Reactive [Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Testing_media_queries)

## Usage

```tsx
import { useMediaQuery } from '@reause/core'

const isLargeScreen = useMediaQuery('(min-width: 1024px)')
const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)')
```

### Source Forms

`query` is a read-only value source and takes a plain `string` (upstream:
`MaybeRefOrGetter<string>`). Resolve a React ref or state value at the call site:

```tsx
const [query, setQuery] = useState('(min-width: 1024px)')

const matches = useMediaQuery(query) // re-binds when `query` changes
const refMatches = useMediaQuery(queryRef.current) // resolve a React ref at the call site
```

#### Server Side Rendering and Nuxt

If you are using `useMediaQuery` with SSR enabled, specify which screen size you would like to
render on the server and before hydration to avoid a hydration mismatch:

```tsx
const isLarge = useMediaQuery('(min-width: 1024px)', {
  ssrWidth: 768, // Will enable SSR mode and render like if the screen was 768px wide
})

console.log(isLarge) // always false because ssrWidth of 768px is smaller than 1024px
useEffect(() => {
  console.log(isLarge) // false if screen is smaller than 1024px, true if larger than 1024px
}, [isLarge])
```

Alternatively you can set this up globally for your app using [`SSRWidthProvider`](/core/useSSRWidth/): every
`useMediaQuery` below the provider renders against the provided width, so a per-hook `ssrWidth` is only needed to
override it.

```tsx
import { SSRWidthProvider } from '@reause/core'

<SSRWidthProvider width={768}>
  <App />
</SSRWidthProvider>
```

## Type Declarations

```ts
/**
 * React port of VueUse's `useMediaQuery`.
 *
 * Map from @vueuse/core `useMediaQuery`
 * (`source/vueuse/packages/core/useMediaQuery/`), which creates a
 * `MediaQueryList` for the query string and returns a reactive boolean
 * (`computed`) that flips on its `change` event. Reactive
 * [Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Testing_media_queries)
 * — a plain boolean, `true` while the query matches.
 *
 * React divergences:
 * - the Vue `computed<boolean>` return becomes a plain boolean state, so
 *   components re-render on media query changes;
 * - the `matchMedia` query and its `change` listener attach inside a
 *   self-contained `useEffect` (upstream binds through `useEventListener`)
 *   and are removed on unmount;
 * - `query` is a read-only value source and takes a plain `string`
 *   (upstream: `MaybeRefOrGetter<string>`; resolve a React ref or getter at
 *   the call site) and the media query re-binds when it changes;
 * - `window` is a read-only value source (`ConfigurableWindow`) that defaults
 *   to the global `window` (upstream's `defaultWindow`); pass `window: null`
 *   to force the `ssrWidth` fallback;
 * - the upstream `ssrSupport` branch (a numeric `ssrWidth` fallback that
 *   approximates the query from a simulated viewport width) is resolved
 *   synchronously during render with no `window` access, so the server markup
 *   and the first client render both carry the simulated match (upstream does
 *   the same in its setup-time `watchEffect`); once `matchMedia` is available
 *   the mount effect replaces it with the real result, matching upstream's
 *   `ssrSupport` exit on mount;
 * - `ssrWidth` comes from the per-hook `ssrWidth` option or, when that is
 *   omitted, from the closest `SSRWidthProvider` above the caller (read
 *   through `useSSRWidth()`, upstream's `provideSSRWidth`). The per-hook
 *   option takes precedence over the provided width, exactly like upstream's
 *   `const { ssrWidth = useSSRWidth() } = options`. Without a provider and
 *   without the option the hook keeps its plain client behaviour — `false`
 *   until `matchMedia` answers — and never throws, so `undefined` can never
 *   reach the returned boolean.
 *
 * @example
 * const isLargeScreen = useMediaQuery('(min-width: 1024px)')
 * const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)')
 */
export declare function useMediaQuery(
  query: string,
  options?: ConfigurableWindow & {
    ssrWidth?: number
  },
): boolean
```
