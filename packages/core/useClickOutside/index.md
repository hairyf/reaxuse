---
category: Sensors
---

# useClickOutside

Listen for clicks outside of an element. Useful for modals or dropdowns — React port of VueUse's [`onClickOutside`](https://vueuse.org/core/onClickOutside/).

**Mapping:** the Vue composable becomes a React hook. `onClickOutside` attaches `click`, `pointerdown` and
(optionally, with `detectIframe`) `blur` listeners on the `window` (or a custom `window` option) and calls
the handler when a click lands outside the resolved `target` element. The `target` accepts a plain element,
a ref-like `{ current }` object (e.g. a `useRef`) or a getter (`MaybeRefOrGetter`). `ignore` suppresses the
handler for matching elements (refs or CSS selectors), `capture` controls the phase of the internal `click`
listener (default `true`), and `detectIframe` also fires the handler when focus moves to an iframe. The
upstream `controls` option is dropped — the return is always a single stop function (`() => void`) that
removes all registered listeners (upstream also returns a `{ stop, cancel, trigger }` controls object).
SSR-safe: nothing touches `window` during render, listeners bind in effects and are removed on unmount.

## Usage

```tsx
import { useClickOutside } from '@reaxuse/core'
import { useRef } from 'react'

function App() {
  const target = useRef<HTMLDivElement>(null)

  useClickOutside(target, (event) => {
    console.log(event)
  })

  return (
    <div>
      <div ref={target}>
        Hello world
      </div>
      <div>Outside element</div>
    </div>
  )
}
```

### Return Value

By default, `useClickOutside` returns a `stop` function to remove the event listeners.

```tsx
const stop = useClickOutside(target, handler)

// Later, stop listening
stop()
```

### Ignore Elements

Use the `ignore` option to prevent certain elements from triggering the handler. Provide elements as an array of refs or CSS selectors.

```tsx
const ignoreElRef = useRef<HTMLDivElement>(null)

useClickOutside(
  target,
  event => console.log(event),
  { ignore: [ignoreElRef, '.ignore-class', '#ignore-id'] },
)
```

### Capture Phase

By default, the event listener uses the capture phase (`capture: true`). Set `capture: false` to use the bubbling phase instead.

```tsx
useClickOutside(target, handler, { capture: false })
```

### Detect Iframe Clicks

Clicks inside an iframe are not detected by default. Enable `detectIframe` to also trigger the handler when focus moves to an iframe.

```tsx
useClickOutside(target, handler, { detectIframe: true })
```

<DemoContainer name="UseClickOutside" />

## Type Declarations

```ts
export interface UseClickOutsideOptions extends ConfigurableWindow {
  ignore?: MaybeRefOrGetter<(MaybeRefOrGetter<Element | null> | string)[]>
  capture?: boolean
  detectIframe?: boolean
}

export type UseClickOutsideHandler = (event: PointerEvent | FocusEvent) => void

export function useClickOutside<T extends UseClickOutsideOptions>(
  target: MaybeRefOrGetter<Element | null | undefined>,
  handler: UseClickOutsideHandler,
  options?: T,
): () => void
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/onClickOutside/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/onClickOutside/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/onClickOutside/index.browser.test.ts) (mirrored in `packages/core/src/useClickOutside.test.tsx`),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/core/onClickOutside/index.md) (docs),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/onClickOutside/demo.vue) (ported to `packages/core/useClickOutside/demo.tsx`). The Vue-only `directive.ts` / `component.ts` variants are not ported — React has no directive / wrapper-component equivalent; use the hook directly.
- reaxuse: [`packages/core/src/useClickOutside.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useClickOutside.ts), docs + demo co-located in `packages/core/useClickOutside/`

<Contributors name="useClickOutside" />
