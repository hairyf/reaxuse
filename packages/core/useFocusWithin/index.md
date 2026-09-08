---
category: Sensors
---

# useFocusWithin

Reactive utility to track if an element or one of its descendants has focus — React port of VueUse's
[`useFocusWithin`](https://vueuse.org/core/useFocusWithin/). It is meant to match the behavior of the
`:focus-within` CSS pseudo-class. A common use case would be on a form element to see if any of its
inputs currently have focus.

**Mapping:** upstream tracks the focus state through `focusin` / `focusout` listeners composed with
`useEventListener`, re-checking `target.matches(':focus-within')` on `focusout` (so focus moving
between two descendants keeps `focused` true), and guards setup on `useActiveElement` → the React
port returns `{ focused }` with `focused` as a plain boolean, attaches the listeners in an effect
(re-binding when the resolved element or the `window` option changes; a ref that is `null` on the
first render starts tracking once React attaches the element), checks `document.activeElement`
validity in the same effect, and removes the listeners on unmount.

## Usage

```tsx
import { useFocusWithin } from '@reaxuse/core'
import { useRef } from 'react'

const target = useRef<HTMLFormElement>(null)
const { focused } = useFocusWithin(target)

// `focused` is true while the form or any input inside it has focus
```

<DemoContainer name="UseFocusWithin" />

## Type Declarations

```ts
export interface UseFocusWithinReturn {
  focused: boolean
}

export function useFocusWithin(
  target: ElementTarget,
  options?: ConfigurableWindow,
): UseFocusWithinReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useFocusWithin/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFocusWithin/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFocusWithin/index.test.ts) (mirrored as browser tests),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFocusWithin/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useFocusWithin.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useFocusWithin.ts), docs + demo co-located in `packages/core/useFocusWithin/`

<Contributors name="useFocusWithin" />
