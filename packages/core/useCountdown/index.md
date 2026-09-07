---
category: Time
---

# useCountdown

Reactive countdown timer in seconds — React port of VueUse's
[`useCountdown`](https://vueuse.org/core/useCountdown/).

**Mapping:** upstream returns an object of shallow refs/controls
(`remaining`, `reset`, `stop`, `start`, `pause`, `resume`, `isActive`) — here
`remaining` is a plain number state and `isActive` a plain boolean. The ticking
interval composes shared `useIntervalFn` (upstream's default scheduler ticks
every `1000` ms), driven by an `interval` option — upstream's
`ConfigurableScheduler` `scheduler` option has no React equivalent and is not
ported. `start(countdown?)`/`reset(countdown?)` accept a number, a ref-like
`{ current }` or a getter for the next countdown; `stop()` pauses and resets to
the initial value, `pause()`/`resume()` freeze/thaw in place (resume is a no-op
once the countdown has reached 0). SSR-safe — timers only ever run inside
effects, never during render.

## Usage

```tsx
import { useCountdown } from '@reaxuse/core'

const countdownSeconds = 5
const { remaining, start, stop, pause, resume } = useCountdown(countdownSeconds, {
  onComplete() {

  },
  onTick() {

  },
})

start() // begins counting down from 5
```

The initial countdown can also be a ref-like object (`{ current }`) or a getter,
and `start()`/`reset()` accept a new countdown value for the next countdown.

```tsx
import { useCountdown } from '@reaxuse/core'

const countdown = { current: 5 }
const { start, reset } = useCountdown(countdown)

// change the countdown value
countdown.current = 10

// start a new countdown with 2 seconds
start(2)

// reset the countdown to 4, but do not start it
reset(4)

// start the countdown with the current value of `countdown`
start()
```

<DemoContainer name="UseCountdown" />

## Type Declarations

```ts
export interface UseCountdownOptions {
  /**
   * Countdown interval in milliseconds.
   *
   * @default 1000
   */
  interval?: number
  /**
   * Callback function called when the countdown reaches 0.
   */
  onComplete?: () => void
  /**
   * Callback function called on each tick of the countdown.
   */
  onTick?: () => void
}

export interface UseCountdownReturn {
  /**
   * Current countdown value.
   */
  remaining: number
  /**
   * Resets the countdown to its initial value.
   */
  reset: (countdown?: MaybeRefOrGetter<number>) => void
  /**
   * Stops the countdown and resets its state.
   */
  stop: () => void
  /**
   * Resets the countdown and starts it again.
   */
  start: (countdown?: MaybeRefOrGetter<number>) => void
  /**
   * Pauses the countdown — the interval is cleared, `remaining` stays put.
   */
  pause: () => void
  /**
   * Resumes a paused countdown; no-op once it has reached 0 or while running.
   */
  resume: () => void
  /**
   * Whether the countdown interval is currently active.
   */
  isActive: boolean
}

export function useCountdown(
  initialCountdown: MaybeRefOrGetter<number>,
  options?: UseCountdownOptions,
): UseCountdownReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useCountdown/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCountdown/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCountdown/index.browser.test.ts) (mirrored in `useCountdown.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useCountdown/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useCountdown.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useCountdown.ts), docs + demo co-located in `packages/core/useCountdown/`

<Contributors name="useCountdown" />
