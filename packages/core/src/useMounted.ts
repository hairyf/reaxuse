import { useEffect, useState } from 'react'

/**
 * React port of VueUse's `useMounted`.
 *
 * Map from @vueuse/core `useMounted`
 * (`source/vueuse/packages/core/useMounted/`). Mounted state as a plain
 * boolean — `true` once the component has mounted.
 *
 * Mapping: `shallowRef(false)` + `onMounted` → `useState(false)` + a mount
 * `useEffect` calling the setter. The state update happens after the first
 * render, so the value stays `false` during render and on the server
 * (SSR-safe), then flips to `true` once the effect runs.
 *
 * @example
 * const isMounted = useMounted()
 */
export function useMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}
