import { useCallback, useState } from 'react'

export type UseToggleReturn<T extends boolean | number | string = boolean> = [
  T,
  (value?: T | ((current: T) => T)) => void,
]

/**
 * React port of VueUse's `useToggle`.
 *
 * Map from @vueuse/shared `useToggle`
 * Mapping: `ref(initialValue)` → `useState(initialValue)`,
 * `toggle()` → stable `useCallback`.
 *
 * @example
 * const [value, toggle] = useToggle()
 * toggle()        // false → true
 * toggle(false)   // force to false
 */
export function useToggle<T extends boolean | number | string = boolean>(
  initialValue: T = false as T,
): UseToggleReturn<T> {
  const [state, setState] = useState<T>(initialValue)

  const toggle = useCallback((value?: T | ((current: T) => T)) => {
    setState((current) => {
      if (typeof value === 'function')
        return (value as (c: T) => T)(current)
      return (value !== undefined ? value : !current) as T
    })
  }, [])

  return [state, toggle]
}
