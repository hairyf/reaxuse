---
category: Sensors
---

# useParallax

Create parallax effect easily. It uses `useDeviceOrientation` and fallback to `useMouse` if orientation is not supported.

**Mapping:** the Vue `tilt`/`roll`/`source` computeds become plain values derived during render from `useState` — the returned object is `{ tilt, roll, source }`. The `deviceorientation` subscription (upstream `useDeviceOrientation`) and the cursor tracking (upstream `useMouseInElement` with `handleOutside: false`) live in self-contained mount `useEffect`s; the element rect is re-measured on window `scroll`/`resize` instead of upstream's observer wiring. `target` accepts a plain element, a ref-like `{ current }` object or a getter. SSR-safe — no `window` access during render, so the server renders `{ tilt: 0, roll: 0, source: 'mouse' }`.

## Usage

```tsx
import { useParallax } from '@reaxuse/core'
import { useRef } from 'react'

const container = useRef<HTMLDivElement>(null)
const { tilt, roll, source } = useParallax(container)
```

```tsx
<div ref={container} />
```

<DemoContainer name="UseParallax" />

## Type Declarations

```ts
export interface UseParallaxOptions {
  deviceOrientationTiltAdjust?: (i: number) => number
  deviceOrientationRollAdjust?: (i: number) => number
  mouseTiltAdjust?: (i: number) => number
  mouseRollAdjust?: (i: number) => number
  window?: Window
}

export interface UseParallaxReturn {
  roll: number
  tilt: number
  source: 'deviceOrientation' | 'mouse'
}

export function useParallax(
  target: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options?: UseParallaxOptions,
): UseParallaxReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useParallax/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useParallax/index.ts) (implementation),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/core/useParallax/index.md) (docs; no upstream tests),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useParallax/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useParallax.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useParallax.ts), docs + demo co-located in `packages/core/useParallax/`

<Contributors name="useParallax" />
