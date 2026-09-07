---
category: Browser
related:
  - useDark
  - usePreferredDark
  - useStorage
---

# useColorMode

Reactive color mode (dark / light / customs) with auto data persistence — React port of VueUse's [`useColorMode`](https://vueuse.org/core/useColorMode/).

**Mapping:** the Vue `Ref<T | BasicColorSchema> & { store, system, state }` return becomes a `useState`-backed
tuple `[mode, setMode]`. `mode` is the resolved color mode, `setMode` writes it, persists it to
`localStorage` (or a custom `storage`) under `storageKey` and updates the target element's
`class`/attribute. Composes the already-ported `useStorage` (persistence) and `usePreferredDark`
(system preference), and supports `selector`/`attribute`/`storageKey`/`storage`/`modes`,
`onChanged`, `emitAuto`, `disableTransition` and `storageRef` options mirroring upstream.

**React divergences:**

- the raw `store` (persisted value) and `system` (raw system preference) surfaces are not exposed —
  `mode` already reflects both through the `auto` translation (persist the `auto` choice, resolve it
  to `'dark'`/`'light'` on read). Read the `storageKey` directly or compose `usePreferredDark`
  yourself when the raw values are needed;
- the DOM `class`/attribute update and the initial storage read run in a `useEffect`, so SSR renders
  the translated `initialValue` and only touches `window`/`document`/storage after mount;
- options are captured once at mount (upstream destructures them once at setup) — changing them
  between renders has no effect; `initialValue` is resolved once at mount;
- `storageRef` accepts a ref-like `{ current }` object as the external store (upstream's `Ref`):
  writes go to `storageRef.current` and trigger a re-render through internal state;
- `selector` accepts a string (re-queried on every update) or a plain element / ref-like
  `{ current }` object (upstream's `MaybeElementRef`).

## Basic Usage

```tsx
import { useColorMode } from '@reaxuse/core'

const [mode, setMode] = useColorMode()
```

By default, it will match with users' browser preference using `usePreferredDark` (a.k.a `auto` mode). When reading the state, it will by default return the current color mode (`dark`, `light` or your custom modes). The `auto` mode can be included in the returned modes by enabling the `emitAuto` option. When writing to the state, it will trigger DOM updates and persist the color mode to local storage (or your custom storage). You can pass `auto` to set back to auto mode.

```tsx
import { useColorMode } from '@reaxuse/core'

const [mode, setMode] = useColorMode()
// ---cut---
mode // 'dark' | 'light'

setMode('dark') // change to dark mode and persist

setMode('auto') // change to auto mode
```

## Config

```tsx
import { useColorMode } from '@reaxuse/core'

const [mode, setMode] = useColorMode({
  attribute: 'theme',
  modes: {
    // custom colors
    dim: 'dim',
    cafe: 'cafe',
  },
}) // 'dark' | 'light' | 'dim' | 'cafe'
```

## Advanced Usage

You can also explicit access to the system preference and storaged user override mode — in React the
storage key holds the raw (possibly `auto`) choice and `usePreferredDark` reports the system
preference:

```tsx
import { useColorMode, usePreferredDark, useStorage } from '@reaxuse/core'

const [mode, setMode] = useColorMode()
const [store] = useStorage('vueuse-color-scheme', 'auto') // 'dark' | 'light' | 'auto'
const isDark = usePreferredDark() // system preference
```

<DemoContainer name="UseColorMode" />

## Type Declarations

```ts
export type BasicColorMode = 'light' | 'dark'
export type BasicColorSchema = BasicColorMode | 'auto'

export interface UseColorModeOptions<T extends string = BasicColorMode> extends UseStorageOptions<T | BasicColorMode> {
  /**
   * CSS Selector for the target element applying to
   *
   * @default 'html'
   */
  selector?: string | MaybeRef<HTMLElement | null>
  /**
   * HTML attribute applying the target element
   *
   * @default 'class'
   */
  attribute?: string
  /**
   * The initial color mode
   *
   * @default 'auto'
   */
  initialValue?: MaybeRefOrGetter<T | BasicColorSchema>
  /**
   * Prefix when adding value to the attribute
   */
  modes?: Partial<Record<T | BasicColorSchema, string>>
  /**
   * A custom handler for handle the updates.
   * When specified, the default behavior will be overridden.
   *
   * @default undefined
   */
  onChanged?: (mode: T | BasicColorMode, defaultHandler: ((mode: T | BasicColorMode) => void)) => void
  /**
   * Custom storage ref
   *
   * When provided, `useStorage` will be skipped
   */
  storageRef?: { current: T | BasicColorSchema }
  /**
   * Key to persist the data into localStorage/sessionStorage.
   *
   * Pass `null` to disable persistence
   *
   * @default 'vueuse-color-scheme'
   */
  storageKey?: string | null
  /**
   * Storage object, can be localStorage or sessionStorage
   */
  storage?: StorageLike
  /**
   * Emit `auto` mode from state
   *
   * When set to `true`, preferred mode won't be translated into `light` or `dark`.
   * This is useful when the fact that `auto` mode was selected needs to be known.
   *
   * @default undefined
   * @deprecated use the stored value when `auto` mode needs to be known
   * @see https://vueuse.org/core/useColorMode/#advanced-usage
   */
  emitAuto?: boolean
  /**
   * Disable transition on switch
   *
   * @see https://paco.me/writing/disable-theme-transitions
   * @default true
   */
  disableTransition?: boolean
}

export type UseColorModeReturn<T extends string = BasicColorMode> = [
  mode: T | BasicColorSchema,
  setMode: (mode: T | BasicColorSchema) => void,
]
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useColorMode/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useColorMode/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useColorMode/index.browser.test.ts) (mirrored here in `useColorMode.test.tsx`),
  [`component.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useColorMode/component.ts) (Vue component variant — not ported to React),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useColorMode/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useColorMode.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useColorMode.ts), docs + demo co-located in `packages/core/useColorMode/`

<Contributors name="useColorMode" />
