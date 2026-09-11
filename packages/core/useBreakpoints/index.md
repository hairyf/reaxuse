---
category: Browser
---

# useBreakpoints

Reactive viewport breakpoints

## Usage

```tsx
import { breakpointsTailwind, useBreakpoints } from '@reause/core'

const breakpoints = useBreakpoints(breakpointsTailwind)

const smAndLarger = breakpoints.greaterOrEqual('sm') // sm and larger
const largerThanSm = breakpoints.greater('sm') // only larger than sm
const lgAndSmaller = breakpoints.smallerOrEqual('lg') // lg and smaller
const smallerThanLg = breakpoints.smaller('lg') // only smaller than lg
```

```tsx
import { useBreakpoints } from '@reause/core'

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

#### Server Side Rendering and Nuxt

If you are using `useBreakpoints` with SSR enabled, then you need to specify which screen size you would like to render
on the server and before hydration to avoid a hydration mismatch

```ts
import { breakpointsTailwind, useBreakpoints } from '@reause/core'

const breakpoints = useBreakpoints(breakpointsTailwind, {
  ssrWidth: 768 // Will enable SSR mode and render like if the screen was 768px wide
})
```

Alternatively you can set this up globally for your app using [`SSRWidthProvider`](/core/useSSRWidth/): every
`useBreakpoints` below the provider renders against the provided width, so a per-hook `ssrWidth` is only needed to
override it.

```tsx
import { SSRWidthProvider } from '@reause/core'

<SSRWidthProvider width={768}>
  <App />
</SSRWidthProvider>
```

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

_Breakpoint presets are standalone exported objects (they are not returned by `useBreakpoints`), so import the preset you
need explicitly:_

```js
import { breakpointsTailwind } from '@reause/core'
// and so on
```
