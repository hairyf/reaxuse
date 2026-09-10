---
category: Sensors
---

# usePageLeave

Reactive state to show whether the mouse leaves the page

## Usage

```tsx
import { usePageLeave } from '@reaxuse/core'

const isLeft = usePageLeave() // boolean
```

## Type Declarations

```ts
/**
 * React port of VueUse's `usePageLeave`.
 *
 * Map from @vueuse/core `usePageLeave`
 * (`source/vueuse/packages/core/usePageLeave/`). Reactive state showing
 * whether the mouse has left the page, as a plain boolean — `true` when the
 * pointer exits the window/document boundary, `false` otherwise.
 *
 * React divergences:
 * - the Vue `ShallowRef<boolean>` return becomes a plain boolean state;
 * - the `mouseout`/`mouseleave`/`mouseenter` listeners live in a
 *   self-contained `useEffect` (upstream composes `useEventListener`) and
 *   are removed on unmount;
 * - the handler reads `event.relatedTarget`/`event.toElement` directly — the
 *   legacy `window.event` fallback is dropped since the DOM always passes
 *   the event object to the listener.
 *
 * @example
 * const isLeft = usePageLeave()
 */
export declare function usePageLeave(options?: ConfigurableWindow): boolean
```
