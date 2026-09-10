---
category: Elements
---

# useWindowFocus

Reactive window focus state

## Usage

```tsx
import { useWindowFocus } from '@reaxuse/core'

const focused = useWindowFocus() // boolean
```

## Type Declarations

```ts
/**
 * React port of VueUse's `useWindowFocus`.
 *
 * Map from @vueuse/core `useWindowFocus`
 * (`source/vueuse/packages/core/useWindowFocus/`). Reactively track window
 * focus with `window.onfocus` and `window.onblur`. Focus state as a plain
 * boolean — `true` on the window `focus` event, `false` on `blur`.
 *
 * React divergences:
 * - the Vue `ShallowRef<boolean>` return becomes a plain boolean state;
 * - the `focus`/`blur` listeners live in a self-contained `useEffect`
 *   (upstream composes `useEventListener`) and are removed on unmount;
 * - the initial `document.hasFocus()` sync happens in the mount effect
 *   instead of during setup, so SSR renders the `false` default without
 *   touching `window.document` (matching upstream's no-window value), and a
 *   falsy `window` — including a JS-passed `null` — disables tracking
 *   entirely, mirroring upstream's `if (!window) return false`.
 *
 * @example
 * const focused = useWindowFocus()
 */
export declare function useWindowFocus(options?: ConfigurableWindow): boolean
```
