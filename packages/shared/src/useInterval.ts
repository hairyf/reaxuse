import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseIntervalOptions<Controls extends boolean = false> {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls
  /**
   * Start the interval automatically on mount
   *
   * @default true
   */
  immediate?: boolean
  /**
   * Callback on every interval tick, receives the incremented count
   */
  callback?: (count: number) => void
  /**
   * Increment the counter (and fire `callback`) immediately when the interval
   * starts or `resume` is called
   *
   * @default false
   */
  immediateCallback?: boolean
}

export interface UseIntervalControls {
  /**
   * Current count
   */
  counter: number
  /**
   * Reset the counter to `0`
   */
  reset: () => void
  /**
   * `true` while the interval is running
   */
  isActive: boolean
  /**
   * Stop the interval
   */
  pause: () => void
  /**
   * (Re)start the interval
   */
  resume: () => void
}

export type UseIntervalReturn = number | UseIntervalControls

/**
 * React port of VueUse's `useInterval`.
 *
 * Mapping: upstream wraps `useIntervalFn` and returns a readonly
 * `ShallowRef<number>`; since `useIntervalFn` is mapped in its own module,
 * this port inlines the interval logic to stay self-contained — the counter
 * is a plain `number` state (no `.value`), the setup-time `resume()`
 * (`immediate`) becomes an empty-dependency `useEffect` on mount, and
 * `tryOnScopeDispose(pause)` becomes the effect cleanup. `{ controls: true }`
 * exposes `counter` / `reset` plus the `Pausable` controls (`isActive` /
 * `pause` / `resume`). `interval` accepts a number or a getter (upstream:
 * `MaybeRefOrGetter<number>`) evaluated on start / `resume`; unlike
 * upstream's reactive watch on the interval, a changed value takes effect on
 * the next `resume()`. `immediateCallback` follows `useIntervalFn`'s
 * semantics (upstream `useInterval` doesn't forward it). `pause` / `resume` /
 * `reset` are stable `useCallback`s.
 *
 * @example
 * // count will increase every 200ms
 * const counter = useInterval(200)
 *
 * const { counter, isActive, pause, resume, reset } = useInterval(200, { controls: true })
 */
export function useInterval(interval?: number | (() => number), options?: UseIntervalOptions<false>): number
export function useInterval(interval: number | (() => number), options: UseIntervalOptions<true>): UseIntervalControls
export function useInterval(
  interval: number | (() => number) = 1000,
  options: UseIntervalOptions<boolean> = {},
): number | UseIntervalControls {
  const {
    controls: exposeControls = false,
    immediate = true,
    callback,
    immediateCallback = false,
  } = options

  // keep the latest interval / callbacks in refs so `pause`, `resume` and
  // `reset` stay referentially stable
  const intervalRef = useRef(interval)
  intervalRef.current = interval
  const callbackRef = useRef(callback)
  callbackRef.current = callback
  const immediateCallbackRef = useRef(immediateCallback)
  immediateCallbackRef.current = immediateCallback

  const [counter, setCounter] = useState(0)
  const counterRef = useRef(0)
  // upstream reports `isActive === true` right after setup (interval > 0);
  // initialize lazily so the first render already reflects it
  const [isActive, setIsActive] = useState(() =>
    immediate && (typeof interval === 'function' ? interval() : interval) > 0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tick = useCallback(() => {
    counterRef.current += 1
    setCounter(counterRef.current)
    callbackRef.current?.(counterRef.current)
  }, [])

  const reset = useCallback(() => {
    counterRef.current = 0
    setCounter(0)
  }, [])

  const pause = useCallback(() => {
    setIsActive(false)
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resume = useCallback(() => {
    const ms = typeof intervalRef.current === 'function' ? intervalRef.current() : intervalRef.current
    if (ms <= 0)
      return
    setIsActive(true)
    if (immediateCallbackRef.current)
      tick()
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    timerRef.current = setInterval(tick, ms)
  }, [tick])

  // upstream resumes synchronously during setup when `immediate`; in React the
  // equivalent is a mount effect — its cleanup also pauses the timer on unmount
  // (upstream: tryOnScopeDispose(pause))
  useEffect(() => {
    if (immediate)
      resume()
    return () => {
      pause()
    }
  }, [])

  if (exposeControls)
    return { counter, reset, isActive, pause, resume }

  return counter
}
