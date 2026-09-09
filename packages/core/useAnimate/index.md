---
category: Animation
---

# useAnimate

Reactive [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)

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

Either an array of keyframe objects, or a keyframe object, or a ref-like `{ current }` object. See
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
