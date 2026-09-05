import type { MaybeRef } from './index'

export type UseArrayReducer<PV, CV, R> = (previousValue: PV, currentValue: CV, currentIndex: number) => R

export type UseArrayReduceReturn<T = any> = T

function isRefLike<T>(value: MaybeRef<T>): value is { current: T } {
  return typeof value === 'object' && value !== null && 'current' in value
}

function toValue<T>(value: MaybeRef<T>): T {
  return isRefLike(value) ? value.current : value
}

/**
 * Reactive `Array.reduce`
 *
 * React port of VueUse's `useArrayReduce`.
 *
 * Mapping: upstream wraps `toValue(list).reduce(...)` in `computed(() => ...)`
 * and returns a `ComputedRef`; React has no reactive value tracking, so this
 * is a plain function recomputed on every render. Vue refs map to the repo's
 * `MaybeRef` (`{ current }`) objects: the list itself may be ref-like, every
 * element is unwrapped before the reducer runs, and so are the accumulator
 * and the initial value — a function initial value is invoked as an upstream
 * `MaybeRefOrGetter` getter on each evaluation. Mutating a ref element or the
 * array does not trigger anything by itself — the new result shows up on the
 * next render.
 *
 * @see https://vueuse.org/shared/useArrayReduce/
 *
 * @example
 * const list = [{ current: 1 }, { current: 2 }, { current: 3 }]
 * useArrayReduce(list, (prev, item) => prev + item) // 6
 * list[0].current = 4 // 9 on the next render
 *
 * @param list - the array was called upon.
 * @param reducer - a "reducer" function.
 *
 * @returns the value that results from running the "reducer" callback function to completion over the entire array.
 */
export function useArrayReduce<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  reducer: UseArrayReducer<T, T, T>,
): UseArrayReduceReturn<T>

/**
 * Reactive `Array.reduce`
 *
 * @param list - the array was called upon.
 * @param reducer - a "reducer" function.
 * @param initialValue - a value to be initialized the first time when the callback is called.
 *
 * @returns the value that results from running the "reducer" callback function to completion over the entire array.
 */
export function useArrayReduce<T, U>(
  list: MaybeRef<MaybeRef<T>[]>,
  reducer: UseArrayReducer<U, T, U>,
  initialValue: MaybeRef<U>,
): UseArrayReduceReturn<U>

export function useArrayReduce<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  reducer: ((...p: any[]) => any),
  ...args: any[]
): UseArrayReduceReturn<T> {
  const reduceCallback = (sum: any, value: any, index: number) => reducer(toValue(sum), toValue(value), index)
  const resolved = isRefLike(list) ? list.current : list

  // Depending on the behavior of reduce, undefined is also a valid initialization value,
  // and this code will distinguish the behavior between them.
  return (
    args.length
      ? resolved.reduce(reduceCallback, typeof args[0] === 'function' ? toValue(args[0]()) : toValue(args[0]))
      : resolved.reduce(reduceCallback)
  ) as T
}
