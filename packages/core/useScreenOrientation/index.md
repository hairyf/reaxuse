---
category: Browser
---

# useScreenOrientation

Reactive [Screen Orientation API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API) — React port of VueUse's [`useScreenOrientation`](https://vueuse.org/core/useScreenOrientation/). It provides web developers with information about the user's current screen orientation.

**Mapping:** the `orientation`/`angle` shallowRefs become plain state values and `isSupported`
(upstream `useSupported`) a plain boolean — all computed in a mount `useEffect` that also
subscribes the window `orientationchange` listener (upstream `useEventListener`, passive) and
removes it on unmount. The initial `screen.orientation` read happens in the mount effect, so
nothing touches `screen` during render (SSR-safe); `lockOrientation`/`unlockOrientation` resolve
`screen.orientation` fresh on each call.

## Usage

```tsx
import { useScreenOrientation } from '@reaxuse/core'

const {
  isSupported,
  orientation,
  angle,
  lockOrientation,
  unlockOrientation,
} = useScreenOrientation()
```

To lock the orientation, pass an [OrientationLockType](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/type) to the `lockOrientation` function:

```tsx
lockOrientation('portrait-primary')
```

and then unlock again, with the following:

```tsx
unlockOrientation()
```

Accepted orientation types are one of `"landscape-primary"`, `"landscape-secondary"`, `"portrait-primary"`, `"portrait-secondary"`, `"any"`, `"landscape"`, `"natural"` and `"portrait"`.

[Screen Orientation API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Orientation_API)

<DemoContainer name="UseScreenOrientation" />

## Type Declarations

```ts
export type OrientationType = 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary'
export type OrientationLockType = 'any' | 'natural' | 'landscape' | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary'

export interface UseScreenOrientationOptions {
  window?: Window
}

export interface UseScreenOrientationReturn {
  isSupported: boolean
  orientation: OrientationType | undefined
  angle: number
  lockOrientation: (type: OrientationLockType) => Promise<void>
  unlockOrientation: () => void
}

export function useScreenOrientation(options?: UseScreenOrientationOptions): UseScreenOrientationReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useScreenOrientation/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScreenOrientation/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScreenOrientation/index.test.ts) (tests mirrored in `packages/core/src/useScreenOrientation.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useScreenOrientation/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useScreenOrientation.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useScreenOrientation.ts), docs + demo co-located in `packages/core/useScreenOrientation/`

<Contributors name="useScreenOrientation" />
