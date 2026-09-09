import type { Dispatch, SetStateAction } from 'react'
import type { State } from '../useControllableState'
import { useCallback, useRef } from 'react'
import { useControllableState } from '../useControllableState'
import { toValue } from '../utils'

export type UseStateManualResetReturn<T> = [
  value: T,
  setValue: Dispatch<SetStateAction<T>>,
  reset: () => void,
]

/**
 * React port of VueUse's `refManualReset`.
 *
 * Map from @vueuse/shared `refManualReset`
 * (`source/vueuse/packages/shared/refManualReset/`). Create a state with
 * manual reset functionality — any update can be reverted back to the initial
 * value with the returned `reset` function.
 *
 * Upstream returns a writable Vue `Ref<T>` extended with a `reset` method
 * (built on `customRef`). Per this repo's naming rules the port is renamed to
 * `useStateManualReset` and the ref becomes a `[value, setValue, reset]`
 * tuple: the second element is the plain `useState` setter (value or updater
 * form), and `reset` restores the default value.
 *
 * The state input accepts the shared `State<T>` form: a value, getter, ref-like
 * object, state tuple, or controlled `{ value, onChange }` object. The reset
 * target is read from that input on every call, so dynamic defaults stay current.
 *
 * @example
 * const [message, setMessage, resetMessage] = useStateManualReset('default message')
 * setMessage('message has set')
 * resetMessage()
 * console.log(message) // 'default message'
 */
export function useStateManualReset<T>(value: State<T>): UseStateManualResetReturn<T> {
  // latest input re-synced each render so `reset` stays stable while reading
  // the current source value when invoked
  const valueRef = useRef(value)
  valueRef.current = value

  const [state, setState] = useControllableState(value, { passive: true })

  const reset = useCallback(() => {
    setState(toValue(valueRef.current))
  }, [])

  return [state, setState, reset]
}
