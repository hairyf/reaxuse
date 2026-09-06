import { useCallback, useRef, useState } from 'react'

export interface UseCounterOptions {
  min?: number
  max?: number
}

export interface UseCounterReturn {
  count: number
  inc: (delta?: number) => void
  dec: (delta?: number) => void
  set: (value: number) => void
  reset: () => void
}

/**
 * React port of VueUse's `useCounter`.
 *
 * Map from @vueuse/shared `useCounter`
 * Mapping: `ref(initialValue)` → `useState`, mutation functions become
 * stable `useCallback`s; options are kept in refs so callbacks stay stable.
 *
 * @example
 * const { count, inc, dec, set, reset } = useCounter(10, { min: 0, max: 100 })
 */
export function useCounter(
  initialValue = 0,
  options: UseCounterOptions = {},
): UseCounterReturn {
  const { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY } = options
  const minRef = useRef(min)
  const maxRef = useRef(max)
  const [count, setCount] = useState(initialValue)

  const set = useCallback((value: number) => {
    setCount((current) => {
      const next = Math.min(Math.max(value, minRef.current), maxRef.current)
      return current === next ? current : next
    })
  }, [])

  const inc = useCallback((delta = 1) => {
    setCount((current) => {
      const next = Math.min(current + delta, maxRef.current)
      return current === next ? current : next
    })
  }, [])

  const dec = useCallback((delta = 1) => {
    setCount((current) => {
      const next = Math.max(current - delta, minRef.current)
      return current === next ? current : next
    })
  }, [])

  const reset = useCallback(() => set(initialValue), [set, initialValue])

  return { count, inc, dec, set, reset }
}
