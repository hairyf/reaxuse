import type { State } from '../useControllableState'
import { useCallback } from 'react'
import { useControllableState } from '../useControllableState'

export type UseToggleReturn<T extends boolean | number | string = boolean> = [
  T,
  (value?: T | ((current: T) => T)) => void,
]

/**
 * React port of VueUse's `useToggle`.
 *
 * Map from @vueuse/shared `useToggle`
 * Mapping: `ref(initialValue)` → `useControllableState(initialValue)`,
 * `toggle()` → stable `useCallback`; accepts the full `State<T>` input.
 *
 * @example
 * const [value, toggle] = useToggle()
 * toggle()        // false → true
 * toggle(false)   // force to false
 */
export function useToggle<T extends boolean | number | string = boolean>(
  initialValue: State<T> = false as T,
): UseToggleReturn<T> {
  const [state, setState] = useControllableState(initialValue, { passive: true })

  const toggle = useCallback((value?: T | ((current: T) => T)) => {
    setState((current) => {
      if (typeof value === 'function')
        return (value as (c: T) => T)(current)
      return (value !== undefined ? value : !current) as T
    })
  }, [setState])

  return [state, toggle]
}
