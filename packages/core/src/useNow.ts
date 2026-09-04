import { useEffect, useState } from 'react'

/**
 * React port of VueUse's `useNow`.
 *
 * Mapping: `ref(Date.now())` + `watch(now, interval)` → `useState` +
 * `useEffect` with `setInterval`, cleaned up on unmount.
 *
 * @example
 * const now = useNow(1000)
 */
export function useNow(interval = 1000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])

  return now
}
