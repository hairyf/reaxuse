import type { Dispatch, SetStateAction } from 'react'
import type { RefOrValue } from '../utils'
import { useCallback, useRef, useState } from 'react'
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
 * The default value accepts a plain value or a ref-like object (`{ current }`)
 * — the shared `RefOrValue` form — resolved with `toValue`. Like the
 * upstream implementation, `reset` re-reads it on every call — a dynamic
 * default always resets to the latest value.
 *
 * @example
 * const [message, setMessage, resetMessage] = useStateManualReset('default message')
 * setMessage('message has set')
 * resetMessage()
 * console.log(message) // 'default message'
 */
export function useStateManualReset<T>(defaultValue: RefOrValue<T>): UseStateManualResetReturn<T> {
  // latest default re-synced each render so `reset` stays a stable callback
  // that always re-reads the up-to-date default value on each call
  const defaultValueRef = useRef(defaultValue)
  defaultValueRef.current = defaultValue

  const [state, setState] = useState<T>(() => toValue(defaultValue))

  const reset = useCallback(() => {
    setState(toValue(defaultValueRef.current))
  }, [])

  return [state, setState, reset]
}
