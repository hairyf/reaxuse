import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseTimestampOptions<Controls extends boolean> {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls

  /**
   * Offset value adding to the value
   *
   * @default 0
   */
  offset?: number

  /**
   * Callback on each update
   */
  callback?: (timestamp: number) => void
}

export interface UseTimestampControls {
  timestamp: number
  isActive: boolean
  pause: () => void
  resume: () => void
}

export type UseTimestampReturn<Controls extends boolean> = Controls extends true
  ? UseTimestampControls
  : number

/**
 * React port of VueUse's `useTimestamp`.
 *
 * Map from @vueuse/core `useTimestamp`
 * (`source/vueuse/packages/core/useTimestamp/`). Reactive current timestamp
 * (`Date.now() + offset`), updated on every animation frame — upstream's
 * default scheduler is `useRafFn`.
 *
 * React divergences:
 * - the upstream `ShallowRef<number>` return becomes a plain `number`
 *   state;
 * - with `controls: true` the return is
 *   `{ timestamp, isActive, pause, resume }`, where `isActive` is a plain
 *   boolean state (upstream's `Pausable` exposes it as a ref) and
 *   `pause`/`resume` toggle the underlying loop;
 * - the rAF loop is inlined in a `useEffect` and cancelled with
 *   `cancelAnimationFrame` on unmount — SSR-safe, since effects never run
 *   on the server;
 * - upstream's `scheduler` option (`ConfigurableScheduler`, backed by Vue
 *   composables like `useRafFn`/`useIntervalFn`) has no React equivalent
 *   and is not ported — the rAF loop is the fixed driver.
 *
 * @example
 * const timestamp = useTimestamp({ offset: 0 })
 */
export function useTimestamp(options?: UseTimestampOptions<false>): number
export function useTimestamp(options: UseTimestampOptions<true>): UseTimestampControls
export function useTimestamp(options: UseTimestampOptions<boolean> = {}): UseTimestampReturn<boolean> {
  const {
    controls = false,
    offset = 0,
    callback,
  } = options

  const [timestamp, setTimestamp] = useState(() => Date.now() + offset)
  const [isActive, setIsActive] = useState(true)

  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    if (!isActive)
      return

    let rafId: number

    function tick() {
      const value = Date.now() + offset
      setTimestamp(value)
      callbackRef.current?.(value)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [isActive, offset])

  const pause = useCallback(() => setIsActive(false), [])
  const resume = useCallback(() => setIsActive(true), [])

  if (controls)
    return { timestamp, isActive, pause, resume }

  return timestamp
}
