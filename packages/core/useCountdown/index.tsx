import type { RefOrValue } from '@reause/shared'
import type { Dispatch, SetStateAction } from 'react'
import { toValue, useIntervalFn } from '@reause/shared'
import { useCallback, useMemo, useRef, useState } from 'react'

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

export type UseCountdownReturn = readonly [
  /**
   * Current countdown value — plain React state (upstream: a shallow ref).
   */
  remaining: number,
  /**
   * Update the countdown with the React state protocol:
   * `setRemaining(next)` or `setRemaining(prev => next)`. It writes the
   * internal remaining state directly — there is no Vue-style ref object.
   */
  setRemaining: Dispatch<SetStateAction<number>>,
  controls: {
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
  },
]

/**
 * React port of VueUse's `useCountdown` — a reactive countdown timer in
 * seconds.
 *
 * Map from @vueuse/core `useCountdown`
 * (`source/vueuse/packages/core/useCountdown/`). Returns a React tuple
 * `[remaining, setRemaining, { reset, stop, start, pause, resume, isActive }]`
 * (upstream: an object mirroring its members). `remaining` is a plain number
 * state (upstream: a shallow ref) that counts down one step per `interval`
 * (default `1000` ms) after `start()` — `setRemaining(next | prev => next)`
 * writes it directly, while `start(countdown?)`/`reset(countdown?)` accept a
 * number or a ref-like `{ current }` to feed a new value. A plain-number
 * `initialCountdown` is captured once at setup (upstream closes over its
 * argument), so a later no-arg `start()`/`reset()` still uses the setup value;
 * pass a ref-like `{ current }` to have it read the latest value. `stop()`
 * pauses and resets to the initial value, `pause()`/`resume()` freeze/thaw in
 * place (resume is a no-op at 0), and `onTick` fires every tick with
 * `onComplete` once the countdown reaches 0.
 *
 * React divergences:
 * - the return is a React tuple
 *   `[remaining, setRemaining, { reset, stop, start, pause, resume, isActive }]`
 *   instead of upstream's object `{ remaining: ShallowRef<number>, reset,
 *   stop, start, pause, resume, isActive }`. `remaining` is plain state and
 *   `setRemaining` is the React state setter — no `.value`, no Vue-style ref
 *   object. A manual write composes with the running interval: the next tick
 *   decrements from the written value;
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
 * const [remaining, setRemaining, { start, stop, pause, resume }] = useCountdown(countdownSeconds)
 *
 * start() // begins counting down from 5
 * setRemaining(10) // jump to 10 on the next render
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

  // the setup-time source is captured once, mirroring upstream's closure over
  // the `initialCountdown` argument: a plain number stays pinned to its setup
  // value for later no-arg `start()`/`reset()`, while a ref-like `{ current }`
  // is still read lazily by `toValue`
  const initialCountdownRef = useRef(initialCountdown)

  const [remaining, setRemainingState] = useState(() => toValue(initialCountdown))
  const remainingRef = useRef(remaining)
  remainingRef.current = remaining

  // the latest callbacks are read on every tick, like the interval's own
  // callback ref
  const onTickRef = useRef(onTick)
  onTickRef.current = onTick
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const isActiveRef = useRef(false)

  // the idiomatic React write path: resolve the action against the latest
  // value, write it into the internal state, and mirror it into the ref the
  // interval callback reads so a manual write composes with the next tick
  const setRemaining = useCallback<Dispatch<SetStateAction<number>>>((action) => {
    const next = typeof action === 'function'
      ? (action as (value: number) => number)(remainingRef.current)
      : action
    remainingRef.current = next
    setRemainingState(next)
  }, [])

  const { isActive, pause, resume: resumeInterval } = useIntervalFn(() => {
    const value = remainingRef.current - 1
    setRemaining(value < 0 ? 0 : value)
    onTickRef.current?.()
    if (remainingRef.current <= 0) {
      pause()
      onCompleteRef.current?.()
    }
  }, interval, { immediate: false })

  isActiveRef.current = isActive

  const reset = useCallback((countdown?: RefOrValue<number>) => {
    const value = toValue(countdown) ?? toValue(initialCountdownRef.current)
    setRemaining(value)
  }, [setRemaining])

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

  // stable controls object — new identity only when its members change
  const controls = useMemo(
    () => ({ reset, stop, start, pause, resume, isActive }),
    [reset, stop, start, pause, resume, isActive],
  )

  return [remaining, setRemaining, controls]
}
