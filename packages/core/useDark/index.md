---
category: Browser
related:
  - useColorMode
  - usePreferredDark
  - useStorage
---

# useDark

Reactive dark mode with auto data persistence

## Usage

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
