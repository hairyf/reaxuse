---
category: Animation
---

# useTransition

Transition between values — React port of VueUse's [`useTransition`](https://vueuse.org/core/useTransition/).

**Mapping:** the Vue `ComputedRef` output becomes a plain value (`number` for a scalar source, `number[]` for an
array source) backed by `useState`: each source change starts a `requestAnimationFrame` tween from the currently
displayed values and re-renders the component on every frame until the target is reached. A newer change cancels
the pending tween and restarts from the interrupted position (generation counter, mirroring upstream's `currentId`
guard).

> [!NOTE]
> This hook tweens values. It is unrelated to React 19's built-in `React.useTransition`
> (concurrent rendering API) — only the name is shared with upstream VueUse, so mind the import source.

## Usage

```tsx
import { TransitionPresets, useTransition } from '@reaxuse/core'
import { useState } from 'react'

const [source, setSource] = useState(0)
const output = useTransition(source, {
  duration: 1000,
  easing: TransitionPresets.easeInOutCubic,
})

// each `setSource(next)` tweens `output` from its current value to `next`
setSource(100)
```

<DemoContainer name="UseTransition" />

## Type Declarations

```ts
export type CubicBezierPoints = [number, number, number, number]

export type EasingFunction = (n: number) => number

export interface UseTransitionOptions {
  /**
   * Manually abort the running transition — checked on every frame
   */
  abort?: () => boolean
  /**
   * Milliseconds to wait before starting the transition
   * @default 0
   */
  delay?: number
  /**
   * Disables the transition — the output follows the source synchronously
   * @default false
   */
  disabled?: boolean
  /**
   * Transition duration in milliseconds
   * @default 1000
   */
  duration?: number
  /**
   * Easing function or cubic bezier points to calculate transition progress
   * @default linear
   */
  easing?: EasingFunction | CubicBezierPoints
  /**
   * Specify a custom `window` instance, e.g. working with iframes or in
   * testing environments
   */
  window?: Window
  /**
   * Callback to execute after the transition finishes
   */
  onFinished?: () => void
  /**
   * Callback to execute after the transition starts
   */
  onStarted?: () => void
}

// Common transitions (bezier points per easing, plus a `linear` easing
// function) — see https://easings.net for the visual reference
export const TransitionPresets: Record<
  'easeInSine' | 'easeOutSine' | 'easeInOutSine' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart'
  | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint' | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo'
  | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc' | 'easeInBack' | 'easeOutBack' | 'easeInOutBack',
  CubicBezierPoints
> & { linear: EasingFunction }

export function useTransition(source: number | (() => number), options?: UseTransitionOptions): number

export function useTransition(source: readonly number[] | (() => readonly number[]), options?: UseTransitionOptions): number[]
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useTransition/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTransition/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTransition/index.browser.test.ts) (mirrored tests),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTransition/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useTransition.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTransition.ts), docs + demo co-located in `packages/core/useTransition/`

<Contributors name="useTransition" />
