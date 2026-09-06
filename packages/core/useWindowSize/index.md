---
category: Elements
---

# useWindowSize

Reactive window size — React port of VueUse's [`useWindowSize`](https://vueuse.org/core/useWindowSize/).

**Mapping:** `shallowRef` width/height + `useEventListener` + `useMediaQuery('(orientation: portrait)')` → a plain
`{ width, height }` state object + a self-contained mount `useEffect` that reads the window, attaches the `resize`
listener (plus the `visualViewport` listener for `type: 'visual'` and the orientation media-query listener when
`listenOrientation`), and removes them all on unmount. The first render reports `initialWidth`/`initialHeight`
(`Number.POSITIVE_INFINITY` by default, matching upstream) without touching `window`, so it is SSR-safe.

## Usage

```tsx
import { useWindowSize } from '@reaxuse/core'

const { width, height } = useWindowSize() // plain numbers, re-render on resize
// SSR renders the Infinity defaults; after mount it tracks the real window size
```

<DemoContainer name="UseWindowSize" />

## Type Declarations

```ts
export interface UseWindowSizeOptions extends ConfigurableWindow {
  initialWidth?: number
  initialHeight?: number
  /**
   * Listen to the `orientation: portrait` media-query change (upstream's
   * stand-in for the `orientationchange` event)
   * @default true
   */
  listenOrientation?: boolean
  /**
   * Whether the scrollbar should be included in the width and height.
   * Only effective when `type` is `'inner'`
   * @default true
   */
  includeScrollbar?: boolean
  /**
   * Use `window.innerWidth` or `window.outerWidth` or `window.visualViewport`
   * @default 'inner'
   */
  type?: 'inner' | 'outer' | 'visual'
}

export interface UseWindowSizeReturn {
  width: number
  height: number
}

export function useWindowSize(options: UseWindowSizeOptions = {}): UseWindowSizeReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useWindowSize/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWindowSize/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWindowSize/index.browser.test.ts) (tests mirrored in `packages/core/src/useWindowSize.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWindowSize/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useWindowSize.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useWindowSize.ts), docs + demo co-located in `packages/core/useWindowSize/`

<Contributors name="useWindowSize" />
