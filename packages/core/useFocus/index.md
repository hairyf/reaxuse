---
category: Sensors
---

# useFocus

Reactive utility to track or set the focus state of a DOM element — React port of VueUse's
[`useFocus`](https://vueuse.org/core/useFocus/).

**Mapping:** upstream returns a writable computed ref (`focused.value = true` focuses the target) →
reaxuse returns `{ focused, isFocused }`: `focused` keeps the upstream `.value` read/write contract
(assign `focused.value = true` / `false` to focus / blur the target; the `focus` / `blur` events
update the state), and `isFocused` is the same state as a plain boolean, convenient for rendering.
The target `focus` / `blur` listeners attach in an effect (passive) and re-attach when the resolved
element changes; upstream's immediate `watch(targetElement, …)` becomes a mount / target-change
effect that applies the `initialValue` option.

## Basic Usage

```tsx
import { useFocus } from '@reaxuse/core'
import { useRef } from 'react'

const input = useRef<HTMLInputElement>(null)
const { focused, isFocused } = useFocus(input)
```

State changes to reflect whether the target element is the focused element. Setting the reactive
`focused.value` from the outside will trigger `focus` and `blur` events for `true` and `false`
values respectively.

## Setting initial focus

To focus the element on its first render one can provide the `initialValue` option as `true`. This
will trigger a `focus` event on the target element.

```tsx
const { focused } = useFocus(input, { initialValue: true })
```

## Change focus state

Changes of the `focused` ref-like value will automatically trigger `focus` and `blur` events for
`true` and `false` values respectively. You can utilize this behavior to focus the target element as
a result of another action (e.g. when a button click as shown below).

```tsx
import { useFocus } from '@reaxuse/core'
import { useRef } from 'react'

function Component() {
  const input = useRef<HTMLInputElement>(null)
  const { focused } = useFocus(input)

  return (
    <div>
      <button type="button" onClick={() => (focused.value = true)}>
        Click me to focus input below
      </button>
      <input ref={input} type="text" />
    </div>
  )
}
```

<DemoContainer name="UseFocus" />

## Type Declarations

```ts
export interface UseFocusOptions extends ConfigurableWindow {
  initialValue?: boolean
  focusVisible?: boolean
  preventScroll?: boolean
}

export interface UseFocusRef {
  value: boolean
}

export interface UseFocusReturn {
  focused: UseFocusRef
  isFocused: boolean
}

export function useFocus(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options?: UseFocusOptions,
): UseFocusReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useFocus/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFocus/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFocus/index.browser.test.ts) (tests mirrored in `packages/core/src/useFocus.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFocus/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useFocus.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useFocus.ts), docs + demo co-located in `packages/core/useFocus/`

<Contributors name="useFocus" />
