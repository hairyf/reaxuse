---
category: Browser
related:
  - useColorMode
  - usePreferredDark
  - useStorage
---

# useDark

Reactive dark mode with auto data persistence.

## Basic Usage

```tsx
import { useDark } from '@reaxuse/core'

const [isDark, toggleDark] = useDark()
toggleDark() // flips dark mode, persists the preference
```

## Behavior

`useDark` combines with `usePreferredDark` and `useStorage`. On start up, it reads the value from localStorage/sessionStorage (the key is configurable) to see if there is a user configured color scheme, if not, it will use users' system preferences. When you change the `isDark` state, it will update the corresponding element's attribute and then store the preference to storage (default key: `vueuse-color-scheme`) for persistence.

> Please note `useDark` only handles the DOM attribute changes for you to apply proper selector in your CSS. It does NOT handle the actual style, theme or CSS for you.

## Configuration

By default, it uses [Tailwind CSS favored dark mode](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually), which enables dark mode when class `dark` is applied to the `html` tag, for example:

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

If the configuration above still does not fit your needs, you can use the `onChanged` option to take full control over how you handle updates.

```tsx
import { useDark } from '@reaxuse/core'
// ---cut---
const [isDark, toggleDark] = useDark({
  onChanged(dark, defaultHandler, mode) {
    // update the dom, call the API or something
  },
})
```

## Component Usage

Not ported — upstream ships a `UseDark` component (Vue, render-slot based); in React the hook is used directly.

## Type Declarations

```ts
export interface UseDarkOptions extends Omit<
  UseColorModeOptions<BasicColorSchema>,
  "modes" | "onChanged"
> {
  /**
   * Value applying to the target element when isDark=true
   *
   * @default 'dark'
   */
  valueDark?: string
  /**
   * Value applying to the target element when isDark=false
   *
   * @default ''
   */
  valueLight?: string
  /**
   * A custom handler for handle the updates.
   * When specified, the default behavior will be overridden.
   *
   * @default undefined
   */
  onChanged?: (
    isDark: boolean,
    defaultHandler: (mode: BasicColorSchema) => void,
    mode: BasicColorSchema,
  ) => void
}
export type UseDarkReturn = [isDark: boolean, toggleDark: () => void]
/**
 * Reactive dark mode with auto data persistence.
 *
 * Map from @vueuse/core `useDark`
 * (`source/vueuse/packages/core/useDark/`), which composes `useColorMode`
 * (`source/vueuse/packages/core/useColorMode/`) with a two-mode palette and a
 * boolean projection. Reactive dark mode with auto data persistence: on
 * start up it reads the value from localStorage (the key is configurable) to
 * see if there is a user configured color scheme, if not, it uses the user's
 * system preference. Changing `isDark` updates the target element's
 * attribute and stores the preference for persistence.
 *
 * React divergences:
 * - the Vue `WritableComputedRef<boolean>` return becomes a state-like tuple
 *   `[isDark, toggleDark]`: `isDark` is plain boolean state (re-renders the
 *   component on change) and `toggleDark` is a toggle callback (upstream
 *   composes `useToggle(isDark)` for the same effect);
 * - the composed `useColorMode` `[mode, setMode]` tuple is projected to a
 *   boolean: `isDark = mode === 'dark'`, and `toggleDark` flips the resolved
 *   mode, storing `auto` when the flipped value equals the system preference
 *   (mirroring upstream's `isDark` setter);
 * - the `onChanged` handler is wrapped with `isDark` and the resolved mode,
 *   as upstream does, and the `modes` map is derived from
 *   `valueDark`/`valueLight` and passed into `useColorMode`;
 * - the component variant (`UseDark`) is not ported (the React port has no
 *   component wrappers).
 *
 * @example
 * const [isDark, toggleDark] = useDark()
 * toggleDark() // flips dark mode, persists the preference
 *
 * @see https://vueuse.org/core/useDark/
 */
export declare function useDark(options?: UseDarkOptions): UseDarkReturn
```
