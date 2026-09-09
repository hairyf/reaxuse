import type { Dispatch, SetStateAction } from 'react'
import type { State } from '../useControllableState'
import { useEffect, useRef, useState } from 'react'
import { useControllableState } from '../useControllableState'
import { useThrottleFn } from '../useThrottleFn'

export type UseStateThrottledReturn<T = any> = [value: T, setValue: Dispatch<SetStateAction<T>>, throttled: T]

/**
 * Throttle changing of a state value — React port of VueUse's `refThrottled`.
 *
 * The `value` argument accepts any `State<T>` supported by
 * `useControllableState`: a plain value, lazy initializer, controlled tuple,
 * or `{ value, onChange }` source. The returned tuple contains the current
 * value, its setter, and a throttled mirror.
 *
 * @param value State source accepted by `useControllableState`.
 * @param delay Delay in milliseconds between commits (default: 200).
 * @param trailing Whether to commit the latest value after the window (default: true).
 * @param leading Whether to commit on the leading edge (default: true).
 */
export function useStateThrottled<T = any>(
  value: State<T>,
  delay = 200,
  trailing = true,
  leading = true,
): UseStateThrottledReturn<T> {
  const [input, setInput] = useControllableState(value, { passive: true })
  const [throttled, setThrottled] = useState(input)
  const inputRef = useRef(input)
  inputRef.current = input

  const throttledFn = useThrottleFn(() => {
    setThrottled(inputRef.current)
  }, delay, trailing, leading)

  const isFirstRunRef = useRef(true)
  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false
      return
    }
    void throttledFn()
  }, [input, throttledFn])

  return [input, setInput, throttled]
}
