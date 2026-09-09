---
category: Browser
related:
  - useDark
  - usePreferredDark
  - useStorage
---

# useColorMode

Reactive color mode (dark / light / customs) with auto data persistence

## Usage

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
