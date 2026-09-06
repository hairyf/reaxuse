---
category: Browser
---

# useScreenSafeArea

Reactive `env(safe-area-inset-*)` — React port of VueUse's [`useScreenSafeArea`](https://vueuse.org/core/useScreenSafeArea/).

**Mapping:** upstream writes the `--vueuse-safe-area-*` custom properties with
`env(safe-area-inset-*, 0px)` fallbacks onto `document.documentElement` (via `useCssVar`), reads their
computed values back via `getComputedStyle(...).getPropertyValue(...)` and refreshes on a debounced
passive `resize` listener (via `useEventListener` + `useDebounceFn`) → here the four `shallowRef`
strings become one state object `{ top, right, bottom, left }` plus a stable `update()` callback;
setup and listener live in a single self-contained mount `useEffect` (removed on unmount). SSR-safe —
nothing touches the DOM during render, the state stays `''` on the server. The values are the
computed style strings (e.g. `0px`), not numbers.

![image](https://webkit.org/wp-content/uploads/safe-areas-1.png)

## Usage

In order to make the page to be fully rendered in the screen, the additional attribute
`viewport-fit=cover` within `viewport` meta tag must be set firstly, the viewport meta tag may look
like this:

```html
<meta name="viewport" content="initial-scale=1, viewport-fit=cover" />
```

Then we could use `useScreenSafeArea` in the component as shown below:

```tsx
import { useScreenSafeArea } from '@reaxuse/core'

const {
  top,
  right,
  bottom,
  left,
  update,
} = useScreenSafeArea()
```

<DemoContainer name="UseScreenSafeArea" />

## Type Declarations

```ts
export interface UseScreenSafeAreaReturn {
  top: string
  right: string
  bottom: string
  left: string
  update: () => void
}

export function useScreenSafeArea(): UseScreenSafeAreaReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useScreenSafeArea/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScreenSafeArea/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScreenSafeArea/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useScreenSafeArea.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useScreenSafeArea.ts), docs + demo co-located in `packages/core/useScreenSafeArea/`

<Contributors name="useScreenSafeArea" />
