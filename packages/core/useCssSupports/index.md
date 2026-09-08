---
category: Browser
---

# useCssSupports

SSR compatible and reactive [`CSS.supports`](https://developer.mozilla.org/docs/Web/API/CSS/supports_static) — React port of VueUse's [`useCssSupports`](https://vueuse.org/core/useCssSupports/).

**Mapping:** upstream returns a `computed<boolean>` gated on `useMounted` that evaluates `window.CSS.supports` with the
resolved property/value or condition text → `{ isSupported }` with `isSupported` as plain `boolean` state. The state
starts at `options.ssrValue` (default `false`) and is recomputed in a mount `useEffect` (SSR-safe — nothing touches
`window` during render). `property` / `value` / `conditionText` accept a plain string or a React
ref (upstream `RefOrValue`) — re-resolved on every render, so a changed resolved input re-evaluates
`CSS.supports`. The two overloads (condition text vs property + value) are detected like upstream: a trailing argument
that resolves to an object is treated as the options bag, otherwise two arguments mean property + value.

## Usage

```tsx
import { useCssSupports } from '@reaxuse/core'

const { isSupported } = useCssSupports('container-type', 'scroll-state')
```

Both the single-argument condition-text form and the property + value form are supported, and every input accepts a
string or a React ref:

```tsx
import { useCssSupports } from '@reaxuse/core'
import { useState } from 'react'

const [property, setProperty] = useState('display')
const [value, setValue] = useState('flex')
const { isSupported: propValueSupported } = useCssSupports(property, value)

const condition = { current: 'selector(:has(a))' }
const { isSupported: conditionSupported } = useCssSupports(condition)
```

### Server Side Rendering

During SSR and before the mount effect runs, the result is `options.ssrValue` (default `false`), so the server-rendered
HTML matches the pre-hydration client render:

```tsx
const { isSupported } = useCssSupports('display: flex', { ssrValue: false })
```

<DemoContainer name="UseCssSupports" />

## Type Declarations

```ts
export interface UseCssSupportsOptions extends ConfigurableWindow {
  /**
   * Result rendered during SSR and before the mount effect evaluates CSS.supports.
   *
   * @default false
   */
  ssrValue?: boolean
}

export interface UseCssSupportsReturn {
  isSupported: boolean
}

export function useCssSupports(
  property: RefOrValue<string>,
  value: RefOrValue<string>,
  options?: UseCssSupportsOptions,
): UseCssSupportsReturn
export function useCssSupports(
  conditionText: RefOrValue<string>,
  options?: UseCssSupportsOptions,
): UseCssSupportsReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useCssSupports/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCssSupports/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCssSupports/index.browser.test.ts) (tests mirrored in `packages/core/src/useCssSupports.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCssSupports/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useCssSupports.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useCssSupports.ts), docs + demo co-located in `packages/core/useCssSupports/`

<Contributors name="useCssSupports" />
