---
category: Animation
---

# useAnimate

Reactive [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) — React port of VueUse's
[`useAnimate`](https://vueuse.org/core/useAnimate/). It creates an `Animation` on the target element with
`Element.animate(keyframes, options)` and mirrors the animation's mutable attributes into state on every frame while it
runs.

**Mapping:** upstream returns `{ isSupported, animate, play/pause/reverse/finish/cancel, pending, playState,
replaceState, startTime, currentTime, timeline, playbackRate }` — the member set is mirrored 1:1, with the Vue refs as
plain values. `isSupported` is `boolean` state settled in a mount effect (SSR-safe). The state members re-render every
animation frame while the animation runs; the writable setters of upstream's `WritableComputedRef`s have no React
equivalent, so seeking (`animate.currentTime = ...`) goes through the returned `animate` object directly. The target is
a plain element, a React ref object (`{ current }`) or a getter; `keyframes` is re-resolved with `toValue` on every
render, so a ref-like `{ current }` keyframes input updates live. The `finish` / `cancel` events stop the store loop,
and the animation is cancelled on unmount.

## Usage

### Basic Usage

The `useAnimate` function returns the animation instance and control functions.

```tsx
import { useAnimate } from '@reaxuse/core'
import { useRef } from 'react'

const el = useRef<HTMLSpanElement>(null)
const {
  isSupported,
  animate,

  // actions
  play,
  pause,
  reverse,
  finish,
  cancel,

  // states
  pending,
  playState,
  replaceState,
  startTime,
  currentTime,
  timeline,
  playbackRate,
} = useAnimate(el, { transform: 'rotate(360deg)' }, 1000)

return <span ref={el} style={{ display: 'inline-block' }}>useAnimate</span>
```

### Custom Keyframes

Either an array of keyframe objects, or a keyframe object, or a ref-like `{ current }`/getter. See
[Keyframe Formats](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats) for more details.

```tsx
import { useAnimate } from '@reaxuse/core'

const keyframes = { transform: 'rotate(360deg)' }
// Or
const keyframes = [
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(360deg)' },
]
// Or
const keyframes = { current: [
  { clipPath: 'circle(20% at 0% 30%)' },
  { clipPath: 'circle(20% at 50% 80%)' },
  { clipPath: 'circle(20% at 100% 30%)' },
] }

useAnimate(el, keyframes, 1000)
```

### Options

The third argument accepts a duration number or an options object with the following additional properties on top of
[KeyframeAnimationOptions](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate#parameters):

```tsx
import { useAnimate } from '@reaxuse/core'

useAnimate(el, keyframes, {
  duration: 1000,
  // Start playing immediately (default: true)
  immediate: true,
  // Commit the end styling state to the element (default: false)
  commitStyles: false,
  // Persist the animation (default: false)
  persist: false,
  // Initial playback rate (default: 1)
  playbackRate: 1,
  // Callback when animation is initialized
  onReady(animate) {
    console.log('Animation ready', animate)
  },
  // Callback when an error occurs
  onError(e) {
    console.error('Animation error', e)
  },
})
```

### Delaying Start

Set `immediate: false` to prevent the animation from starting automatically.

```tsx
import { useAnimate } from '@reaxuse/core'

const { play } = useAnimate(el, keyframes, {
  duration: 1000,
  immediate: false,
})

// Start the animation manually
play()
```

<DemoContainer name="UseAnimate" />

## Type Declarations

```ts
export interface UseAnimateOptions extends KeyframeAnimationOptions, ConfigurableWindow {
  immediate?: boolean // @default true
  commitStyles?: boolean // @default false
  persist?: boolean // @default false
  playbackRate?: number // @default 1
  onReady?: (animate: Animation) => void
  onError?: (e: unknown) => void
}

export type UseAnimateKeyframes = MaybeRefOrGetter<Keyframe[] | PropertyIndexedKeyframes | null>

export interface UseAnimateReturn {
  isSupported: boolean
  animate: Animation | undefined
  play: () => void
  pause: () => void
  reverse: () => void
  finish: () => void
  cancel: () => void
  pending: boolean
  playState: AnimationPlayState
  replaceState: AnimationReplaceState
  startTime: number | CSSNumberish | null
  currentTime: CSSNumberish | null
  timeline: AnimationTimeline | null
  playbackRate: number
}

export function useAnimate(
  target: MaybeComputedElementRef,
  keyframes: UseAnimateKeyframes,
  options?: number | UseAnimateOptions,
): UseAnimateReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useAnimate/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useAnimate/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useAnimate/index.test.ts) and
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useAnimate/index.browser.test.ts) (tests mirrored in `packages/core/src/useAnimate.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useAnimate/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useAnimate.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useAnimate.ts), docs + demo co-located in `packages/core/useAnimate/`

<Contributors name="useAnimate" />
