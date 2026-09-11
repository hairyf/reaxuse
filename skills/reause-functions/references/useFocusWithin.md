---
category: Sensors
---

# useFocusWithin

Reactive utility to track if an element or one of its descendants has focus. It is meant to match the behavior of the `:focus-within` CSS pseudo-class. A common use case would be on a form element to see if any of its inputs currently have focus.

## Basic Usage

```tsx
import { useFocusWithin } from '@reause/core'
import { useRef } from 'react'

const target = useRef<HTMLFormElement>(null)
const { focused } = useFocusWithin(target)

// `focused` is true while the form or any input inside it has focus
```

## Type Declarations

```ts
export interface UseFocusWithinReturn {
  /**
   * True if the element or any of its descendants are focused
   */
  focused: boolean
}
/**
 * Track if focus is contained within the target element.
 *
 * Map from @vueuse/core `useFocusWithin`
 * (`source/vueuse/packages/core/useFocusWithin/`). Tracks whether the target
 * element or any of its descendants currently holds focus — the dynamic
 * equivalent of the `:focus-within` CSS pseudo-class. `focused` flips to
 * `true` on a bubbling `focusin` event and back to `false` on `focusout`,
 * unless the target still matches `:focus-within` (focus moved between two of
 * its descendants). A common use case is a form element: watch `focused` to
 * know if any of its inputs currently has focus.
 *
 * React divergences:
 * - the Vue `ComputedRef<boolean>` return becomes a plain boolean read off
 *   the same object contract (`{ focused }`) as upstream;
 * - the `focusin` / `focusout` listeners (upstream composes `useEventListener`)
 *   attach in an effect and are removed on unmount. The target is re-resolved
 *   after every render and re-bound only when the resolved element or the
 *   `window` option changed, so a React ref that is `null` on the first render
 *   starts tracking once React attaches the element (upstream watches the
 *   `unrefElement` computed the same way);
 * - upstream's `useActiveElement` setup guard becomes a mount-time
 *   `document.activeElement` validity check in the same effect — when it is
 *   `null` no listeners attach and `focused` stays `false`, mirroring
 *   upstream's early return;
 * - the listener options (`{ passive: true }`) and the `:focus-within`
 *   re-check on `focusout` are preserved unchanged.
 *
 * SSR-safe: nothing touches `window` or the DOM during render — the validity
 * check and the listener bindings all happen in effects.
 *
 * @param target - element or React ref object (`{ current }`) returning
 *   the element to track focus within
 * @param options - a custom `window` instance, e.g. working with iframes or
 *   in testing environments
 *
 * @example
 * const target = useRef<HTMLFormElement>(null)
 * const { focused } = useFocusWithin(target)
 * // `focused` is true while the form or any input inside it has focus
 */
export declare function useFocusWithin(
  target: ElementTarget,
  options?: ConfigurableWindow,
): UseFocusWithinReturn
```
