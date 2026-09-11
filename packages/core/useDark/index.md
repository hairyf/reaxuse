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
import { useDark } from '@reause/core'

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
import { useDark } from '@reause/core'
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
import { useDark } from '@reause/core'
// ---cut---
const [isDark, toggleDark] = useDark({
  onChanged(dark, defaultHandler, mode) {
    // update the dom, call the API or something
  },
})
```

## Component Usage

Not ported — upstream ships a `UseDark` component (Vue, render-slot based); in React the hook is used directly.
