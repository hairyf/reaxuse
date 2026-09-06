import { useCallback, useEffect, useRef, useState } from 'react'

type Awaitable<T> = T | Promise<T>

export interface UseTimeoutPollOptions {
  /**
   * Start the timer immediately
   *
   * @default true
   */
  immediate?: boolean

  /**
   * Execute the callback immediately after calling `resume`
   *
   * @default false
   */
  immediateCallback?: boolean
}

export interface Pausable {
  /**
   * `true` while the poll is active
   */
  isActive: boolean
  /**
   * Stop the poll — the pending timeout is cleared and no further runs are
   * scheduled; a callback already in flight still finishes
   */
  pause: () => void
  /**
   * (Re)start the poll — schedules the next run one `interval` later
   */
  resume: () => void
}

/**
 * React port of VueUse's `useTimeoutPoll`.
 *
 * Map from @vueuse/core `useTimeoutPoll`
 * (`source/vueuse/packages/core/useTimeoutPoll/`): a timeout-based poll chain
 * that triggers the callback one `interval` after activation and re-schedules
 * only after the previous run has finished, so a slow poll never overlaps
 * itself. Self-contained `setTimeout` chain (upstream composes
 * `useTimeoutFn`); there is no document-visibility gating in upstream, so
 * none here either.
 *
 * React divergences:
 * - `fn` and `interval` are plain values kept in refs (upstream: closure +
 *   `MaybeRefOrGetter<number>`), so `pause` / `resume` stay referentially
 *   stable and a changing (typically stable) callback identity never restarts
 *   the chain. A changed `interval` re-arms the pending timeout while active,
 *   mirroring upstream's interval watch;
 * - the `isActive` shallow ref becomes a plain boolean state, flipped by
 *   `resume` / `pause` (upstream sets it synchronously during setup);
 * - the setup-time auto `resume()` (`immediate`, client-only) becomes a mount
 *   `useEffect`, and `tryOnScopeDispose(pause)` becomes its cleanup — timers
 *   only ever run inside effects, so SSR renders never touch them;
 * - upstream does not fire the callback synchronously on `resume`: the first
 *   run is scheduled one `interval` after activation. Pass
 *   `immediateCallback: true` to also fire it immediately on (re)activation.
 *
 * @example
 * const { isActive, pause, resume } = useTimeoutPoll(fetchData, 1000)
 */
export function useTimeoutPoll(
  fn: () => Awaitable<void>,
  interval: number,
  options: UseTimeoutPollOptions = {},
): Pausable {
  const { immediate = true, immediateCallback = false } = options

  // keep the latest callback / option values in refs so `pause` and `resume`
  // stay referentially stable and the poll chain never restarts when the
  // (typically stable) callback identity changes
  const fnRef = useRef(fn)
  fnRef.current = fn
  const intervalRef = useRef(interval)
  intervalRef.current = interval
  const immediateCallbackRef = useRef(immediateCallback)
  immediateCallbackRef.current = immediateCallback

  const [isActive, setIsActive] = useState(false)
  const isActiveRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearTimer() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function schedule() {
    clearTimer()
    timerRef.current = setTimeout(loop, intervalRef.current)
  }

  async function loop() {
    timerRef.current = null
    if (!isActiveRef.current)
      return

    await fnRef.current()

    // the next run is scheduled only once the previous one is done — pausing
    // while a callback is in flight ends the chain here
    if (isActiveRef.current)
      schedule()
  }

  const pause = useCallback(() => {
    isActiveRef.current = false
    setIsActive(false)
    clearTimer()
  }, [])

  const resume = useCallback(() => {
    if (isActiveRef.current)
      return

    isActiveRef.current = true
    setIsActive(true)
    if (immediateCallbackRef.current)
      fnRef.current()
    schedule()
  }, [])

  // re-arm the pending timeout with the new interval while active (upstream
  // watches the interval and restarts the timer on change); no-op when paused
  useEffect(() => {
    if (isActiveRef.current)
      schedule()
  }, [interval])

  // upstream resumes synchronously during setup when `immediate`; in React the
  // equivalent is a mount effect — its cleanup also pauses the poll on unmount
  // (upstream: tryOnScopeDispose(pause))
  useEffect(() => {
    if (immediate)
      resume()
    return () => {
      pause()
    }
  }, [immediate, pause, resume])

  return { isActive, pause, resume }
}
