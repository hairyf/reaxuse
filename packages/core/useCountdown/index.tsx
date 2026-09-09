import type { RefOrValue } from '@reaxuse/shared'
import { toValue, useIntervalFn } from '@reaxuse/shared'
import { useCallback, useRef, useState } from 'react'

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
  reset: (countdown?: RefOrValue<number>) => void
  /**
   * Stops the countdown and resets its state.
   */
  stop: () => void
  /**
   * Resets the countdown and starts it again.
   */
  start: (countdown?: RefOrValue<number>) => void
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

/**
 * React port of VueUse's `useCountdown` — a reactive countdown timer in
 * seconds.
 *
 * Map from @vueuse/core `useCountdown`
 * (`source/vueuse/packages/core/useCountdown/`). Returns an object mirroring
 * the upstream members: `{ remaining, reset, stop, start, pause, resume,
 * isActive }`. `remaining` is a plain number state (upstream: a shallow ref)
 * that counts down one step per `interval` (default `1000` ms) after
 * `start()` — call `start(countdown?)`/`reset(countdown?)` with a number or a
 * ref-like `{ current }` to feed a new value. `stop()` pauses and
 * resets to the initial value, `pause()`/`resume()` freeze/thaw in place
 * (resume is a no-op at 0), and `onTick` fires every tick with `onComplete`
 * once the countdown reaches 0.
 *
 * React divergences:
 * - the Vue shallow refs become plain values/booleans off the result object
 *   (`remaining` a number, `isActive` a boolean) — object mirror, no tuple;
 * - the ticking interval composes shared `useIntervalFn` (upstream composes
 *   `useIntervalFn` too, through its `ConfigurableScheduler` `scheduler`
 *   option); the `scheduler` option itself has no React equivalent and is not
 *   ported — the interval is fixed via an `interval` option (upstream's
 *   default scheduler ticks every `1000` ms);
 * - `start`/`resume` begin the interval only from event handlers/effects —
 *   SSR-safe, since timers never run on the server.
 *
 * @example
 * const countdownSeconds = 5
 * const { remaining, start, stop, pause, resume } = useCountdown(countdownSeconds)
 *
 * start() // begins counting down from 5
 */
export function useCountdown(
  initialCountdown: RefOrValue<number>,
  options: UseCountdownOptions = {},
): UseCountdownReturn {
  const {
    interval = 1000,
    onTick,
    onComplete,
  } = options

  // keep the initial countdown source fresh so a later `start()`/`reset()`
  // without arguments re-reads the current value (upstream: `toValue` in the
  // reset closure)
  const initialCountdownRef = useRef(initialCountdown)
  initialCountdownRef.current = initialCountdown

  const [remaining, setRemaining] = useState(() => toValue(initialCountdown))
  const remainingRef = useRef(remaining)

  // the latest callbacks are read on every tick, like the interval's own
  // callback ref
  const onTickRef = useRef(onTick)
  onTickRef.current = onTick
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const isActiveRef = useRef(false)

  const { isActive, pause, resume: resumeInterval } = useIntervalFn(() => {
    const value = remainingRef.current - 1
    remainingRef.current = value < 0 ? 0 : value
    setRemaining(remainingRef.current)
    onTickRef.current?.()
    if (remainingRef.current <= 0) {
      pause()
      onCompleteRef.current?.()
    }
  }, interval, { immediate: false })

  isActiveRef.current = isActive

  const reset = useCallback((countdown?: RefOrValue<number>) => {
    const value = toValue(countdown) ?? toValue(initialCountdownRef.current)
    remainingRef.current = value
    setRemaining(value)
  }, [])

  const stop = useCallback(() => {
    pause()
    reset()
  }, [pause, reset])

  const resume = useCallback(() => {
    if (!isActiveRef.current && remainingRef.current > 0)
      resumeInterval()
  }, [resumeInterval])

  const start = useCallback((countdown?: RefOrValue<number>) => {
    reset(countdown)
    resumeInterval()
  }, [reset, resumeInterval])

  return {
    remaining,
    reset,
    stop,
    start,
    pause,
    resume,
    isActive,
  }
}
