import type { Dispatch, SetStateAction } from 'react'
import type { StateValue } from '../utils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toValue } from '../utils'

export type StateTuple<T> = [T, Dispatch<SetStateAction<T>>]
/** A value, lazy getter, React ref, state tuple, or value/onChange pair. */
export type State<T> = StateValue<T>

export interface UseControllableStateOptions<T> {
  defaultValue?: T | (() => T)
  shouldUpdate?: (prev: T, next: T) => boolean
  passive?: boolean
}

function isTuple<T>(state: State<T>): state is StateTuple<T> {
  return Array.isArray(state) && state.length === 2 && typeof state[1] === 'function'
}

function isObjectState<T>(state: State<T>): state is { value: T, onChange?: (value: T) => void } {
  return typeof state === 'object' && state !== null && !Array.isArray(state) && 'value' in state
}

export function useControllableState<T>(
  state: State<T>,
  options: UseControllableStateOptions<T> = {},
): StateTuple<T> {
  const { defaultValue, shouldUpdate = (prev, next) => !Object.is(prev, next), passive = false } = options
  const controlled = isTuple(state) || isObjectState(state) || !passive
  const externalValue = toValue(state)
  const initial = defaultValue === undefined ? externalValue : typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue
  const [internal, setInternal] = useState<T>(initial)
  const value = controlled ? externalValue : internal
  const valueRef = useRef(value)
  const previousExternalRef = useRef(externalValue)
  valueRef.current = value
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    if (passive && !isTuple(state) && !isObjectState(state) && !Object.is(previousExternalRef.current, externalValue))
      setInternal(externalValue)
    previousExternalRef.current = externalValue
  }, [externalValue, passive])

  const setValue = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    const prev = valueRef.current
    const next = typeof action === 'function' ? (action as (value: T) => T)(prev) : action
    if (!shouldUpdate(prev, next))
      return
    const currentState = stateRef.current
    if (isTuple(currentState))
      currentState[1](next)
    else if (isObjectState(currentState))
      currentState.onChange?.(next)
    else if (!controlled)
      setInternal(next)
  }, [controlled, shouldUpdate])

  return [value, setValue]
}
