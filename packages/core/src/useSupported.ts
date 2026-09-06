import { useEffect, useState } from 'react'

/**
 * React port of VueUse's `useSupported`.
 *
 * Map from @vueuse/core `useSupported`
 * (`source/vueuse/packages/core/useSupported/`). SSR compatibility
 * `isSupported` — `true` when the feature probed by `callback` is supported
 * by the current browser.
 *
 * React divergences:
 * - the Vue `ComputedRef<boolean>` return becomes a plain boolean state;
 * - upstream composes `useMounted` and re-evaluates its `computed` when the
 *   mounted state flips; here the callback runs once in a mount `useEffect`
 *   — React has no reactive dependency tracking, so the result is evaluated
 *   exactly once on mount and never re-evaluated;
 * - the callback is never invoked during render or on the server
 *   (SSR-safe): the value stays `false` until the mount effect runs, the
 *   same value upstream's computed returns before `useMounted` flips.
 *
 * @example
 * const isSupported = useSupported(() => navigator && 'getBattery' in navigator)
 */
export function useSupported(callback: () => unknown): boolean {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(Boolean(callback()))
  }, [])

  return isSupported
}
