import { useEffect } from 'react'

/**
 * React port of react-use's `useMount`.
 *
 * Map from react-use `useMount`.
 * Runs `fn` exactly once after the component mounts.
 *
 * @example
 * useMount(() => {
 *   trackPageView()
 * })
 */
export function useMount(fn: () => void): void {
  useEffect(() => {
    fn()
  }, [])
}
