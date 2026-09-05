import { useEffect, useRef } from 'react'

export type Truthy<T> = T extends false | null | undefined ? never : T

export interface UseWheneverOptions {
  /**
   * Fire the callback on mount if the value is already truthy
   *
   * @default false
   */
  immediate?: boolean
}

/**
 * React port of VueUse's `whenever`.
 *
 * Mapping: upstream `whenever` is Vue's `watch` plus a truthy guard — the
 * callback runs every time the source CHANGES to a truthy value (a re-render
 * with the same truthy value never fires). In React this becomes a `useEffect`
 * watching `[value]`: the initial mount is skipped unless `immediate` (which
 * fires with `oldValue` `undefined`), later runs fire when the value is truthy
 * and actually changed, and the previous value is tracked in a ref updated on
 * every run — mirroring `watch`'s `oldValue`, which advances through falsy
 * values too. There is no stop handle: React tears the effect down on unmount
 * automatically. The callback is kept in a ref so re-renders always invoke the
 * newest one.
 *
 * @see https://vueuse.org/shared/whenever/
 *
 * @example
 * useWhenever(ready, () => console.log(state))
 * useWhenever(ready, () => console.log(state), { immediate: true })
 */
export function useWhenever<T>(
  value: T,
  cb: (value: Truthy<T>, oldValue: T | undefined) => void,
  options?: UseWheneverOptions,
): void {
  const cbRef = useRef(cb)

  // update the ref each render so if it change the newest callback will be invoked
  cbRef.current = cb

  const oldValueRef = useRef<T | undefined>(undefined)
  const isFirstRenderRef = useRef(true)

  useEffect(() => {
    const isFirstRender = isFirstRenderRef.current
    isFirstRenderRef.current = false

    const isMountFire = isFirstRender && options?.immediate === true
    // the change check also keeps StrictMode's double-invoked mount effect
    // from firing the callback twice
    const isChange = !Object.is(oldValueRef.current, value)

    if (value && (isMountFire || (!isFirstRender && isChange)))
      cbRef.current(value as Truthy<T>, oldValueRef.current)

    oldValueRef.current = value
  }, [value])
}
