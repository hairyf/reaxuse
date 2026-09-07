---
category: Browser
---

# useFullscreen

Reactive [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API) — React port of VueUse's [`useFullscreen`](https://vueuse.org/core/useFullscreen/). It adds methods to present a specific element (and its descendants) in full-screen mode, and to exit full-screen mode once it is no longer needed. This makes it possible to present desired content — such as an online game — using the user's entire screen, removing all browser user interface elements and other applications from the screen until full-screen mode is shut off.

**Mapping:** upstream's `computed` / `shallowRef` returns become plain boolean states (`isSupported` resolves in a mount effect, SSR-safe, and `isFullscreen` follows the `fullscreenchange` events and the `enter` / `exit` calls). The vendor-prefixed method detection re-resolves in an effect when the resolved target or the `document` option changes, and the fullscreenchange listeners re-bind when the target changes. `enter` / `exit` / `toggle` are stable callbacks; `tryOnMounted(handlerCallback)` becomes the mount sync and `tryOnScopeDispose(exit)` (with `autoExit`) an unmount cleanup. The target is accepted as a plain element, a ref-like `{ current }` object, or a getter, defaulting to `document.documentElement`. The component variant (`UseFullscreen` render-slot component) is not ported — React uses the hook directly.

## Usage

```tsx
import { useFullscreen } from '@reaxuse/core'

const { isFullscreen, enter, exit, toggle } = useFullscreen()
```

Fullscreen specified element. Some platforms (like iOS's Safari) only allow fullscreen on video elements.

```tsx
import { useFullscreen } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLVideoElement>(null)
const { isFullscreen, enter, exit, toggle } = useFullscreen(el)

// <video ref={el} controls />
```

## Component Usage

Not ported — upstream ships a `UseFullscreen` component (Vue, render-slot based); in React the hook is used directly.

<DemoContainer name="UseFullscreen" />

## Type Declarations

```ts
export type FullscreenTarget = MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>

export interface UseFullscreenOptions {
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in
   * testing environments.
   *
   * @default typeof document !== 'undefined' ? document : undefined
   */
  document?: Document

  /**
   * Automatically exit fullscreen when the component is unmounted.
   *
   * @default false
   */
  autoExit?: boolean
}

export interface UseFullscreenReturn {
  /**
   * If the Fullscreen API is supported by the current browser.
   */
  isSupported: boolean

  /**
   * Whether the target element (or `document.documentElement` when no target
   * is given) is currently displayed in fullscreen mode.
   */
  isFullscreen: boolean

  /**
   * Request fullscreen on the target element.
   */
  enter: () => Promise<void>

  /**
   * Exit fullscreen mode.
   */
  exit: () => Promise<void>

  /**
   * Toggle between entering and exiting fullscreen mode.
   */
  toggle: () => Promise<void>
}

export function useFullscreen(
  target?: FullscreenTarget,
  options?: UseFullscreenOptions,
): UseFullscreenReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useFullscreen/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFullscreen/index.ts) (implementation),
  [`component.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFullscreen/component.ts) (Vue component variant — not ported),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useFullscreen/demo.vue) (ported as `demo.tsx`);
  upstream ships no tests, so `packages/core/src/useFullscreen.test.tsx` covers
  the object-mirror contract: initial state, `enter` / `exit` / `toggle`, the
  fullscreenchange events (document + target), the `document.documentElement`
  default, `autoExit` and SSR safety
- reaxuse: [`packages/core/src/useFullscreen.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useFullscreen.ts), docs + demo co-located in `packages/core/useFullscreen/`

<Contributors name="useFullscreen" />
