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

## React divergences

- The hook returns a `[mode, setMode]` tuple instead of upstream's
  `Ref<T | BasicColorSchema> & { store, system, state }`. The `store` (raw persisted value),
  `system` (system preference) and `state` (translated mode) members are not exposed — read the
  storage key with `useStorage` and the system preference with `usePreferredDark`.
- `storageRef` replaces the persistence layer: `useStorage` is still called internally (rules of
  hooks) but backed by an inert in-memory storage with `writeDefaults: false` and
  `listenToStorageChanges: false`, so no real localStorage is read or written and no
  storage-event listener is registered. A `null` `storageRef.current` falls back to
  `initialValue`, whereas upstream's raw `store.value` passthrough would expose `null`.
- The DOM `class`/attribute update and the initial storage read run after mount (in an effect), so
  SSR renders the translated `initialValue` and never touches `window`/`document`/storage.
