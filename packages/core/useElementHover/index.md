---
category: Sensors
---

# useElementHover

Reactive element's hover state — React port of VueUse's [`useElementHover`](https://vueuse.org/core/useElementHover/).

**Mapping:** upstream's `ShallowRef<boolean>` return becomes a plain boolean backed by React state — `const isHovered = useElementHover(el)`. The `mouseenter` / `mouseleave` listeners attach to the target element in a mount `useEffect` (upstream's `useEventListener` composition is inlined) and are removed on unmount; any pending delay timer is cleared as well. `delayEnter` / `delayLeave` defer the state flip with a debounced timer (a new event cancels the pending one) and `triggerOnRemoval` forces the state back to `false` when the element is removed from the DOM (upstream's `onElementRemoval`, inlined as a `MutationObserver`). The `target` accepts an element, a ref-like `{ current }` object or a getter — it is re-resolved on every render and re-bound whenever the resolved element changes, so a `useRef` target that is `null` on the first render still starts tracking once React attaches the element. The upstream `v-element-hover` directive variant is not ported. SSR-safe — nothing touches `window` or the DOM during render and the initial state is always `false`.

## Usage

```tsx
import { useElementHover } from '@reaxuse/core'
import { useRef } from 'react'

const myHoverableElement = useRef<HTMLButtonElement>(null)
const isHovered = useElementHover(myHoverableElement)
```

```tsx
<button ref={myHoverableElement}>
  {isHovered ? 'Thank you!' : 'Hover me'}
</button>
```

You can also provide hover options:

```tsx
import { useElementHover } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLButtonElement>(null)
const isHovered = useElementHover(el, { delayEnter: 200, delayLeave: 600 })

// leave detection is also supported on elements being removed from the DOM
const isHoveredWithRemoval = useElementHover(el, { triggerOnRemoval: true })
```

<DemoContainer name="UseElementHover" />

## Type Declarations

```ts
export interface UseElementHoverOptions extends ConfigurableWindow {
  /**
   * Delay in milliseconds before the hover state is set to `true`
   *
   * @default 0
   */
  delayEnter?: number
  /**
   * Delay in milliseconds before the hover state is set to `false`
   *
   * @default 0
   */
  delayLeave?: number
  /**
   * Whether to set the hover state to `false` when the element is removed
   * from the DOM
   *
   * @default false
   */
  triggerOnRemoval?: boolean
  /**
   * Allow a custom `window` instance, e.g. working with iframes or in testing
   * environments.
   */
  window?: Window
}

export function useElementHover(
  target: MaybeRefOrGetter<EventTarget | null | undefined>,
  options?: UseElementHoverOptions,
): boolean
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useElementHover/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementHover/index.ts) (implementation),
  [`directive.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementHover/directive.test.ts) (Vue directive tests — the directive is not ported; the reaxuse tests are self-authored key cases in `packages/core/src/useElementHover.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useElementHover/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useElementHover.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useElementHover.ts), docs + demo co-located in `packages/core/useElementHover/`

<Contributors name="useElementHover" />
