---
category: Sensors
---

# useOnline

Reactive online state

## Usage

```tsx
import { useOnline } from '@reause/core'

const online = useOnline() // boolean
```

## Type Declarations

```ts
/**
 * React port of VueUse's `useOnline`.
 *
 * Map from @vueuse/core `useOnline`
 * (`source/vueuse/packages/core/useOnline/`), which composes `useNetwork`
 * and returns its `isOnline` ref. Reactive online state as a plain boolean —
 * `true` while the browser reports a network connection.
 *
 * React divergences:
 * - the Vue `isOnline` ref return becomes a plain boolean state;
 * - the window `online`/`offline` listeners live in a self-contained
 *   `useEffect` (upstream uses `useEventListener`) and are removed on
 *   unmount;
 * - the initial `navigator.onLine` read happens in a lazy state initializer
 *   (the mount effect re-syncs it, e.g. when the `window` option changes), so
 *   the first render already reflects the real connection state instead of
 *   flashing `true`; during SSR, or when the window's navigator lacks
 *   `onLine`, it keeps upstream's `true` default.
 *
 * @example
 * const online = useOnline()
 */
export declare function useOnline(options?: ConfigurableWindow): boolean
```
