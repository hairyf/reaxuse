---
category: Browser
---

# useBreakpoints

Reactive viewport breakpoints — React port of VueUse's [`useBreakpoints`](https://vueuse.org/core/useBreakpoints/).

**Mapping:** upstream composes one `useMediaQuery` `ComputedRef` per breakpoint key (lazily created from `defineProperty`
getters and method calls) and returns an object of shortcut booleans plus comparison helpers. In React, hooks cannot be
created at property-read time, so `useBreakpoints` eagerly creates four `useMediaQuery` queries per key (min/max, each
with the ±0.1 delta that separates strict/equal comparisons) and exposes plain booleans instead of `ComputedRef`s. The
returned object is a **mirror object** (not a tuple): every breakpoint key becomes a boolean (e.g. `breakpoints.md`),
and the dynamic-key methods (`greaterOrEqual('sm')`, ...) return booleans from the current render — so the `breakpoints`
map and the keys passed to those methods must stay stable across renders. `current()` / `active()` are plain functions
recomputed from the current render's booleans, staying in sync with media query changes. The `is*` helpers evaluate
`window.matchMedia().matches` synchronously (non-reactive, matching upstream). SSR via the `ssrWidth` option is evaluated
inside the `useMediaQuery` mount effects: the server renders the `false`/empty default and the simulated values appear
after hydration (same caveat as `useMediaQuery`).

## Usage

```tsx
import { breakpointsTailwind, useBreakpoints } from '@reaxuse/core'

const breakpoints = useBreakpoints(breakpointsTailwind)

const smAndLarger = breakpoints.greaterOrEqual('sm') // sm and larger
const largerThanSm = breakpoints.greater('sm') // only larger than sm
const lgAndSmaller = breakpoints.smallerOrEqual('lg') // lg and smaller
const smallerThanLg = breakpoints.smaller('lg') // only smaller than lg
```

```tsx
import { useBreakpoints } from '@reaxuse/core'

const breakpoints = useBreakpoints({
  mobile: 0, // optional
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
})

// Can be 'mobile' or 'tablet' or 'laptop' or 'desktop'
const activeBreakpoint = breakpoints.active()

// true or false
const laptop = breakpoints.between('laptop', 'desktop')
```

### Shortcut Methods

You can access breakpoints directly as properties on the returned object. These are reactive booleans.

```ts
const breakpoints = useBreakpoints({
  tablet: 640,
  laptop: 1024,
})

// Equivalent to breakpoints.greaterOrEqual('tablet') with min-width strategy
const isTablet = breakpoints.tablet
```

### Strategy

The `strategy` option controls how the shortcut properties behave:

- `min-width` (default, mobile-first): `breakpoints.lg` is `true` when viewport is `>= lg`
- `max-width` (desktop-first): `breakpoints.lg` is `true` when viewport is `< xl`

```ts
const breakpoints = useBreakpoints(breakpointsTailwind, {
  strategy: 'max-width', // desktop-first
})
```

### Available Methods

| Method                | Description                               |
| --------------------- | ----------------------------------------- |
| `greaterOrEqual(k)`   | Reactive: viewport width >= breakpoint    |
| `greater(k)`          | Reactive: viewport width > breakpoint     |
| `smallerOrEqual(k)`   | Reactive: viewport width <= breakpoint    |
| `smaller(k)`          | Reactive: viewport width < breakpoint     |
| `between(a, b)`       | Reactive: viewport width between a and b  |
| `isGreaterOrEqual(k)` | Non-reactive: returns boolean immediately |
| `isGreater(k)`        | Non-reactive: returns boolean immediately |
| `isSmallerOrEqual(k)` | Non-reactive: returns boolean immediately |
| `isSmaller(k)`        | Non-reactive: returns boolean immediately |
| `isInBetween(a, b)`   | Non-reactive: returns boolean immediately |
| `current()`           | Array of all matching breakpoints         |
| `active()`            | String of the current active breakpoint   |

#### Server Side Rendering

If you are using `useBreakpoints` with SSR enabled, then you need to specify which screen size you would like to render
on the server and before hydration to avoid a hydration mismatch

```ts
import { breakpointsTailwind, useBreakpoints } from '@reaxuse/core'

const breakpoints = useBreakpoints(breakpointsTailwind, {
  ssrWidth: 768 // Will enable SSR mode and render like if the screen was 768px wide
})
```

<DemoContainer name="UseBreakpoints" />

## Presets

- Tailwind: `breakpointsTailwind`
- Bootstrap v5: `breakpointsBootstrapV5`
- Vuetify v2: `breakpointsVuetifyV2` (deprecated: `breakpointsVuetify`)
- Vuetify v3: `breakpointsVuetifyV3`
- Ant Design: `breakpointsAntDesign`
- Quasar v2: `breakpointsQuasar`
- Sematic: `breakpointsSematic`
- Master CSS: `breakpointsMasterCss`
- Prime Flex: `breakpointsPrimeFlex`
- ElementUI / ElementPlus: `breakpointsElement`

_Breakpoint presets are deliberately not auto-imported, as they do not start with `use` to have the scope of VueUse. They
have to be explicitly imported:_

```js
import { breakpointsTailwind } from '@reaxuse/core'
// and so on
```

## Type Declarations

```ts
type RefOrValue<T> = T | Ref<T> // imported from '@reaxuse/shared'

interface ConfigurableWindow {
  window?: Window
}

type Breakpoints<K extends string = string> = Record<K, RefOrValue<number | string>>

interface UseBreakpointsOptions extends ConfigurableWindow {
  strategy?: 'min-width' | 'max-width' // default: 'min-width'
  ssrWidth?: number
}

type UseBreakpointReturn<K extends string = string> = Record<K, boolean> & {
  greaterOrEqual: (k: RefOrValue<K>) => boolean
  smallerOrEqual: (k: RefOrValue<K>) => boolean
  greater: (k: RefOrValue<K>) => boolean
  smaller: (k: RefOrValue<K>) => boolean
  between: (a: RefOrValue<K>, b: RefOrValue<K>) => boolean
  isGreater: (k: RefOrValue<K>) => boolean
  isGreaterOrEqual: (k: RefOrValue<K>) => boolean
  isSmaller: (k: RefOrValue<K>) => boolean
  isSmallerOrEqual: (k: RefOrValue<K>) => boolean
  isInBetween: (a: RefOrValue<K>, b: RefOrValue<K>) => boolean
  current: () => K[]
  active: () => K | ''
}

export function useBreakpoints<K extends string>(
  breakpoints: Breakpoints<K>,
  options?: UseBreakpointsOptions,
): UseBreakpointReturn<K>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useBreakpoints/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBreakpoints/index.ts) (implementation),
  [`breakpoints.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBreakpoints/breakpoints.ts) (presets),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBreakpoints/index.browser.test.ts) (tests to mirror),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBreakpoints/index.md) (docs),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBreakpoints/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useBreakpoints.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useBreakpoints.ts), docs + demo co-located in `packages/core/useBreakpoints/`

<Contributors name="useBreakpoints" />
