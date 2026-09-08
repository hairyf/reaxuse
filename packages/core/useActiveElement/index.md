---
category: Elements
---

# useActiveElement

Reactive `document.activeElement` — React port of VueUse's [`useActiveElement`](https://vueuse.org/core/useActiveElement/).
Returns a plain `HTMLElement | undefined` that updates when focus changes.

**Mapping:** upstream returns a `ShallowRef<T | null | undefined>` seeded with `document.activeElement` and
subscribes via `useEventListener` → a plain `T | undefined` state value seeded in a mount effect, with
`focus` / `blur` / `pointerdown` listeners attached in a `useEffect` (`{ capture: true, passive: true }`) and
removed on unmount. `deep: true` (default) traverses open shadow roots to return the deeply active element;
`document` accepts a `Document` or an open `ShadowRoot` (upstream `ConfigurableDocumentOrShadowRoot`);
`triggerOnRemoval` observes the resolved document with a `MutationObserver` and re-triggers when the active
element is removed from the DOM. `undefined` replaces upstream's `null` when nothing is focused. The
`UseActiveElement` component variant is Vue-specific and is not ported.

## Usage

```tsx
import { useActiveElement } from '@reaxuse/core'

const activeElement = useActiveElement()

// React keyed on the element — re-runs when focus moves
useEffect(() => {
  console.log('focus changed to', activeElement)
}, [activeElement])
```

### Shadow DOM Support

By default, `useActiveElement` will traverse into shadow DOM to find the deeply active element. Set `deep: false` to disable this behavior.

```tsx
import { useActiveElement } from '@reaxuse/core'

// Only get the shadow host, not the element inside shadow DOM
const activeElement = useActiveElement({ deep: false })
```

### Track Element Removal

Set `triggerOnRemoval: true` to update the active element when the currently active element is removed from the DOM. This uses a `MutationObserver` under the hood.

```tsx
import { useActiveElement } from '@reaxuse/core'

const activeElement = useActiveElement({ triggerOnRemoval: true })
```

<DemoContainer name="UseActiveElement" />

## Type Declarations

```ts
export interface UseActiveElementOptions extends ConfigurableWindow {
  document?: Document | ShadowRoot
  deep?: boolean
  triggerOnRemoval?: boolean
}

export function useActiveElement<T extends HTMLElement = HTMLElement>(
  options?: UseActiveElementOptions,
): T | undefined
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useActiveElement/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useActiveElement/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useActiveElement/index.browser.test.ts) (mirrored by `useActiveElement.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useActiveElement/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useActiveElement.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useActiveElement.ts), docs + demo co-located in `packages/core/useActiveElement/`

<Contributors name="useActiveElement" />
