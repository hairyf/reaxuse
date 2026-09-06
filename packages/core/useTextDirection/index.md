---
category: Browser
---

# useTextDirection

Reactive [dir](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir) of the element's text —
React port of VueUse's [`useTextDirection`](https://vueuse.org/core/useTextDirection/).

**Mapping:** the writable Vue computed ref return becomes the `[dir, setDir]` tuple. `setDir` accepts a
value or an updater function (like `setState`) and writes `dir` back to the target element, mirroring the
computed's `set()`; the initial DOM read happens in a mount effect, so no `document` is touched during
render and SSR renders the `initialValue` default (`'ltr'`).

## Usage

```tsx
import { useTextDirection } from '@reaxuse/core'

const [dir, setDir] = useTextDirection() // ['ltr' | 'rtl' | 'auto', setter]
// <html dir="rtl"> → dir === 'rtl'
setDir('ltr') // writes dir="ltr" back to <html>
```

By default it targets the `<html>` tag. Pass a `selector` to target another element:

```tsx
const [mode, setMode] = useTextDirection({ selector: 'body' })
```

With `observe: true` the hook watches `document.querySelector(selector)` with a MutationObserver and
follows external `dir` changes:

```tsx
const [dir, setDir] = useTextDirection({ observe: true })
```

<DemoContainer name="UseTextDirection" />

## Type Declarations

```ts
export type UseTextDirectionValue = 'ltr' | 'rtl' | 'auto'

export interface UseTextDirectionOptions {
  /**
   * CSS selector for the target element applying to.
   *
   * @default 'html'
   */
  selector?: string
  /**
   * Observe `document.querySelector(selector)` changes using a MutationObserver.
   *
   * @default false
   */
  observe?: boolean
  /**
   * Initial value, also the SSR default — no `document` access happens during render.
   *
   * @default 'ltr'
   */
  initialValue?: UseTextDirectionValue
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in testing environments.
   */
  document?: Document
}

export type UseTextDirectionReturn = [
  dir: UseTextDirectionValue,
  setDir: Dispatch<SetStateAction<UseTextDirectionValue>>,
]

export function useTextDirection(options?: UseTextDirectionOptions): UseTextDirectionReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useTextDirection/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTextDirection/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTextDirection/index.test.ts) (tests mirrored in `packages/core/src/useTextDirection.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTextDirection/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useTextDirection.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTextDirection.ts), docs + demo co-located in `packages/core/useTextDirection/`

<Contributors name="useTextDirection" />
