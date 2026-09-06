import { useEffect, useRef } from 'react'

/**
 * React port of VueUse's `usePrevious`.
 *
 * Map from @vueuse/core `usePrevious`
 * (`source/vueuse/packages/core/usePrevious/`). Holds the previous value of
 * a source: `undefined` until the source changes for the first time, then
 * the value the source had before the current one.
 *
 * Mapping: `shallowRef` + `watch(..., { flush: 'sync' })` → a `useRef` cache
 * updated in a `useEffect` keyed on the value. The update is committed after
 * each change, so a render reads the value the source had on the previous
 * render — and the hook stays `undefined` during SSR (no effects run on the
 * server).
 *
 * Divergences from the Vue upstream:
 * - React values are plain, so the source is a plain `T` instead of a
 *   `MaybeRefOrGetter`, and the hook returns the value itself instead of a
 *   readonly shallow ref.
 * - The upstream `initialValue` overload is not ported (not part of the
 *   mapped API); the first previous value is always `undefined`.
 * - Vue tracks the source reactively; React only sees a new value when the
 *   component rerenders with one — nested mutations of the same object are
 *   not tracked (matching the upstream shallow watch), and an unchanged
 *   rerender reports the previous render's value.
 *
 * @example
 * const previous = usePrevious(counter) // `undefined` until the first change
 *
 * @see   {@link https://vueuse.org/core/usePrevious}
 */
export function usePrevious<T>(value: T): T | undefined {
  const previousRef = useRef<T | undefined>(undefined)

  useEffect(() => {
    previousRef.current = value
  }, [value])

  return previousRef.current
}
