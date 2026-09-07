---
category: Browser
related:
  - useColorMode
  - usePreferredDark
  - useStorage
---

# useDark

Reactive dark mode with auto data persistence — React port of VueUse's [`useDark`](https://vueuse.org/core/useDark/).

**Mapping:** upstream returns a writable Vue `computed<boolean>` and relies on `useColorMode` (#95,
not yet implemented here) for the persistence/attribute logic. The reaxuse port returns a
`[isDark, toggleDark]` tuple (plain boolean state + toggle callback), and inlines `useColorMode`'s
necessary logic: the `prefers-color-scheme` detection (via `usePreferredDark`), the storage-backed
mode store (via `useStorage`, default key `vueuse-color-scheme`) and the attribute application /
`onChanged` dispatch — ready to be refactored onto `useColorMode` once it lands. On start up it
reads the value from localStorage to see if there is a user configured color scheme; if not, it
uses the system preference. Changing `isDark` updates the target element's attribute and stores the
preference for persistence.

> Please note `useDark` only handles the DOM attribute changes for you to apply proper selector in
> your CSS. It does NOT handle the actual style, theme or CSS for you.

## Basic Usage

```tsx
import { useDark } from '@reaxuse/core'

const [isDark, toggleDark] = useDark()
toggleDark() // flips dark mode, persists the preference
```

By default it uses [Tailwind CSS favored dark mode](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually), which enables dark mode when class `dark` is applied to the `html` tag, for example:

```html
<!--light-->
<html>
  ...
</html>

<!--dark-->
<html class="dark">
  ...
</html>
```

Still, you can also customize it to make it work with most CSS frameworks. For example:

```tsx
import { useDark } from '@reaxuse/core'
// ---cut---
const [isDark, toggleDark] = useDark({
  selector: 'body',
  attribute: 'color-scheme',
  valueDark: 'dark',
  valueLight: 'light',
})
```

will work like

```html
<!--light-->
<html>
  <body color-scheme="light">
    ...
  </body>
</html>

<!--dark-->
<html>
  <body color-scheme="dark">
    ...
  </body>
</html>
```

If the configuration above still does not fit your needs, you can use the `onChanged` option to
take full control over how you handle updates.

```tsx
import { useDark } from '@reaxuse/core'
// ---cut---
const [isDark, toggleDark] = useDark({
  onChanged(dark, defaultHandler, mode) {
    // update the dom, call the API or something
  },
})
```

<DemoContainer name="UseDark" />

## Type Declarations

```ts
export type BasicColorMode = 'light' | 'dark'
export type BasicColorSchema = BasicColorMode | 'auto'

export interface UseDarkOptions extends ConfigurableWindow {
  /**
   * Value applying to the target element when isDark=true
   * @default 'dark'
   */
  valueDark?: string
  /**
   * Value applying to the target element when isDark=false
   * @default ''
   */
  valueLight?: string
  /**
   * A custom handler for handle the updates.
   * When specified, the default behavior will be overridden.
   * @default undefined
   */
  onChanged?: (isDark: boolean, defaultHandler: (mode: BasicColorSchema) => void, mode: BasicColorSchema) => void
  /**
   * CSS Selector for the target element applying to
   * @default 'html'
   */
  selector?: string
  /**
   * HTML attribute applying the target element
   * @default 'class'
   */
  attribute?: string
  /**
   * The initial color mode
   * @default 'auto'
   */
  initialValue?: BasicColorSchema
  /**
   * Key to persist the data into localStorage/sessionStorage.
   * Pass `null` to disable persistence
   * @default 'vueuse-color-scheme'
   */
  storageKey?: string | null
  /**
   * Storage object, can be localStorage or sessionStorage
   * @default localStorage
   */
  storage?: StorageLike
  /**
   * Listen to storage changes
   * @default true
   */
  listenToStorageChanges?: boolean
  /**
   * Disable transition on switch
   * @default true
   */
  disableTransition?: boolean
}

export type UseDarkReturn = [
  isDark: boolean,
  toggleDark: () => void,
]

export function useDark(options?: UseDarkOptions): UseDarkReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useDark/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDark/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDark/index.browser.test.ts) (mirrored tests),
  [`component.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDark/component.ts) (component variant, not ported),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useDark/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useDark.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useDark.ts), docs + demo co-located in `packages/core/useDark/`

<Contributors name="useDark" />
