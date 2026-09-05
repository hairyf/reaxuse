import type { UseWatchCallback } from './useWatch'
import { useCallback, useRef, useState } from 'react'
import { useWatch } from './useWatch'

export interface UseWatchAtMostOptions {
  /**
   * The maximum number of times the callback may fire.
   */
  count: number
  /**
   * Fire the callback once on mount with the current value.
   * @default false
   */
  immediate?: boolean
}

export interface UseWatchAtMostReturn {
  /**
   * The number of times the callback has fired so far.
   */
  count: number
  /**
   * Stop watching before the limit is reached.
   */
  stop: () => void
}

// overloads
export function useWatchAtMost<T extends any[]>(source: readonly [...T], callback: UseWatchCallback<[...T]>, options: UseWatchAtMostOptions): UseWatchAtMostReturn
export function useWatchAtMost<T>(source: T, callback: UseWatchCallback<T>, options: UseWatchAtMostOptions): UseWatchAtMostReturn

// implementation
/**
 * React port of VueUse's `watchAtMost` — `watch` with the number of times
 * triggered.
 *
 * Mapping: built on the house `useWatch`. The callback is wrapped with a fire
 * counter: each invocation increments the `count` state (exposed in the
 * return so components re-render), and once the limit — `options.count` — is
 * reached the wrapper marks the watcher as stopped so further source changes
 * are ignored. A manual `stop()` has the same effect before the limit.
 *
 * Divergences from upstream:
 * - upstream stops the underlying watcher via `stop()` scheduled on
 *   `nextTick`; this port keeps the effect registered but the wrapped callback
 *   becomes a no-op — observable behavior is identical (the callback fires at
 *   most `count` times).
 * - upstream's `pause` / `resume` controls (inherited from
 *   `watchWithFilter`) are not ported — house `useWatch` has no pausable
 *   infrastructure.
 * - upstream's `count` return is a shallow ref; here it is React state so
 *   reads re-render.
 *
 * @example
 * ```tsx
 * const { count, stop } = useWatchAtMost(num, (value, oldValue) => {
 *   console.log(value, oldValue)
 * }, { count: 3 })
 * ```
 */
export function useWatchAtMost(source: any, callback: UseWatchCallback, options: UseWatchAtMostOptions): UseWatchAtMostReturn {
  const { count: maxCount, ...watchOptions } = options

  const [count, setCount] = useState(0)
  const firedRef = useRef(0)
  const stoppedRef = useRef(false)

  // keep the latest limit so a changing `count` option is honored on each fire
  const maxCountRef = useRef(maxCount)
  maxCountRef.current = maxCount

  const stop = useCallback(() => {
    stoppedRef.current = true
  }, [])

  function wrapped(value: any, oldValue: any) {
    if (stoppedRef.current)
      return

    firedRef.current += 1
    setCount(firedRef.current)
    callback(value, oldValue)

    if (firedRef.current >= maxCountRef.current)
      stoppedRef.current = true
  }

  useWatch(source, wrapped, watchOptions)

  return { count, stop }
}
