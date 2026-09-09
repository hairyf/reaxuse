import type { Dispatch, SetStateAction } from 'react'
import type { RefOrValue } from '../index'
import { useEffect, useRef, useState } from 'react'
import { useThrottleFn } from '../useThrottleFn'
import { toValue } from '../utils'

export type UseStateThrottledReturn<T = any> = [
  /**
   * Current value — identical to the `value` a plain `useState` would hold.
   */
  value: T,
  /**
   * Setter to update the value (value or updater form, like `setState`).
   */
  setValue: Dispatch<SetStateAction<T>>,
  /**
   * Throttled mirror of `value` — applied at most once per `delay` window, on
   * the leading and/or trailing edge.
   */
  throttled: T,
]

/**
 * Throttle changing of a state value — React port of VueUse's `refThrottled`
 * renamed to `useStateThrottled` (this repo's naming for the `ref*` family;
 * upstream's single writable ref becomes a tuple).
 *
 * Map from @vueuse/shared `refThrottled`
 * Mapping: upstream wraps the source `Ref<T>` with
 * `useThrottleFn(() => { throttled.value = value.value }, delay, trailing, leading)`
 * and commits on a `watch` of the source (docs example:
 * `const throttled = refThrottled(input, 1000)`). This port owns the state
 * like a `useState` and returns the React tuple
 * `const [input, setInput, throttled] = useStateThrottled('', 1000)` — the
 * first argument only seeds the state (resolved once through `toValue`, so a
 * getter or a `{ current }` ref-like object works for the initial value),
 * later updates go through the returned `setInput`. Every change is pushed
 * through a single `useThrottleFn` instance by an effect (upstream:
 * `watch(value, () => updater())`), so the same leading/trailing throttle
 * window applies; `delay` / `trailing` / `leading` are re-read on every
 * change. `delay <= 0` disables throttling entirely (upstream short-circuits
 * and returns the source ref unchanged).
 *
 * @param   value             Initial value. A plain value, a getter or a
 *                            ref-like `{ current }` — resolved with `toValue`.
 * @param   delay             A zero-or-greater delay in milliseconds between
 *                            value commits. Values around 100 or 250 (or even
 *                            higher) are most useful.
 *                            (default value: 200)
 * @param [trailing] if true, commit the value again after the delay time is up
 *                            (default value: true)
 * @param [leading]  if true, commit the value on the leading edge of the
 *                            delay window (default value: true)
 * @return  A tuple `[value, setValue, throttled]` — the current value, its
 *          setter and the throttled mirror of the value.
 *
 * @example
 * const [input, setInput, throttled] = useStateThrottled('', 1000)
 *
 * setInput('hello') // input updates immediately; throttled follows on the next window edge
 */
export function useStateThrottled<T = any>(
  value: RefOrValue<T>,
  delay = 200,
  trailing = true,
  leading = true,
): UseStateThrottledReturn<T> {
  const initial = toValue(value)

  const [input, setInput] = useState(initial)
  const [throttled, setThrottled] = useState(initial)

  // the throttled commit runs on a timer — always apply the latest input
  const inputRef = useRef(input)
  inputRef.current = input

  const throttledFn = useThrottleFn(() => {
    setThrottled(inputRef.current)
  }, delay, trailing, leading)

  // upstream: `watch(value, () => updater())` — schedule a throttled
  // evaluation whenever the value changes (the returned promise settles when
  // the update is applied; the commit itself happens inside `useThrottleFn`)
  const prevInputRef = useRef(input)
  useEffect(() => {
    if (Object.is(input, prevInputRef.current))
      return
    prevInputRef.current = input
    void throttledFn()
  }, [input, throttledFn])

  return [input, setInput, throttled]
}
