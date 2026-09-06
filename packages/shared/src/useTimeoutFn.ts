import { useCallback, useEffect, useRef, useState } from 'react'

type AnyFn = (...args: any[]) => any

export interface UseTimeoutFnOptions {
  /**
   * Start the timer immediately
   *
   * @default true
   */
  immediate?: boolean
}

export interface UseTimeoutFnReturn<CallbackFn extends AnyFn> {
  isPending: boolean
  stop: () => void
  start: (...args: Parameters<CallbackFn> | []) => void
}

/**
 * React port of VueUse's `useTimeoutFn` — wrapper for `setTimeout` with
 * controls.
 *
 * Map from @vueuse/shared `useTimeoutFn`
 * Mapping: upstream accepts `MaybeRefOrGetter<number>` for the interval — this
 * port accepts a plain `number`. `isPending` becomes a boolean state (upstream:
 * a readonly shallow ref) initialized to `immediate`; the timer is scheduled in
 * a mount effect (upstream starts synchronously during setup) and a pending
 * timer is cleared on unmount via effect cleanup. The latest callback and
 * interval are kept in refs so restarts always use the newest ones. Upstream's
 * `immediateCallback` option is not ported.
 *
 * @example
 * const { isPending, start, stop } = useTimeoutFn(() => { ... }, 3000)
 */
export function useTimeoutFn<CallbackFn extends AnyFn>(
  cb: CallbackFn,
  interval: number,
  options: UseTimeoutFnOptions = {},
): UseTimeoutFnReturn<CallbackFn> {
  const { immediate = true } = options

  const [isPending, setIsPending] = useState(immediate)

  const cbRef = useRef(cb)
  const intervalRef = useRef(interval)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // update the refs each render so a (re)start always uses the newest
  // callback and interval
  cbRef.current = cb
  intervalRef.current = interval

  function clear() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const stop = useCallback(() => {
    setIsPending(false)
    clear()
  }, [])

  const start = useCallback((...args: Parameters<CallbackFn> | []) => {
    clear()
    setIsPending(true)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      setIsPending(false)

      cbRef.current(...args)
    }, intervalRef.current)
  }, [])

  useEffect(() => {
    if (immediate)
      start()

    // clear a pending timer when the component unmounts
    return () => {
      clear()
    }
  }, [immediate, start])

  return { isPending, start, stop }
}
