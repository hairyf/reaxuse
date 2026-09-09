import { useEffect, useState } from 'react'

/**
 * React port of hairylib's `useMounted`.
 *
 * Map from hairylib `useMounted`
 * Mapping: react-use's `useMount` runs a callback once on mount via
 * `useEffectOnce`; hairylib's `useMounted` instead returns a `boolean`
 * that becomes `true` once the component has mounted. This port follows
 * hairylib semantics — `useState(false)` tracks the flag and an empty
 * `useEffect` flips it to `true` after the first render.
 *
 * @example
 * const mounted = useMount()
 * // `false` on the first render, `true` after mount
 */
export function useMount(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
