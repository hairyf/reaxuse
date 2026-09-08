import type { RefOrValue } from '@reaxuse/shared'
import type { Dispatch, SetStateAction } from 'react'
import { isRefLike, toValue } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseCycleListOptions<T> {
  /**
   * The initial value of the state.
   * A ref can be provided to reuse.
   */
  initialValue?: RefOrValue<T>

  /**
   * The default index when the current value is not found in the list.
   */
  fallbackIndex?: number

  /**
   * Custom function to get the index of the current value.
   */
  getIndexOf?: (value: T, list: T[]) => number
}

export interface UseCycleListReturn<T> {
  /** Current item. */
  state: T
  /** Index of the current item — `fallbackIndex` (default `0`) when `state` is not in `list`. */
  index: number
  /** Go to the next item (wraps around the end of the list). */
  next: (n?: number) => T
  /** Go to the previous item (wraps around the start of the list). */
  prev: (n?: number) => T
  /**
   * Go to a specific index.
   */
  go: (i: number) => T
  /**
   * Set the current item directly (value or updater form, like `setState`).
   * React addition — upstream assigns `state.value = v` on a Vue ref.
   */
  setState: Dispatch<SetStateAction<T>>
  /**
   * Set the current index directly (same as `go`, value or updater form).
   * React addition — upstream assigns `index.value = i` on a Vue computed ref.
   */
  setIndex: Dispatch<SetStateAction<number>>
}

/**
 * React port of VueUse's `useCycleList`.
 *
 * Map from @vueuse/core `useCycleList`
 * (`source/vueuse/packages/core/useCycleList/`). Cycle through a list of
 * items — `next`/`prev` move forward/backward wrapping around, `go` jumps to
 * a specific index and the current item is exposed as `state` with its
 * position as `index`.
 *
 * Adjustments from upstream (Vue reactivity does not translate 1:1):
 *
 * 1. `state` and `index` are plain React values (upstream: `ShallowRef` and
 *    `WritableComputedRef`). They are writable through the returned
 *    `setState`/`setIndex` setters (React additions — upstream assigns
 *    `state.value`/`index.value` directly): `setIndex` is the same as `go`,
 *    while `setState` writes the item directly and `index` re-derives from
 *    `getIndexOf ?? list.indexOf`.
 * 2. `list` accepts a plain array, a ref-like (`{ current }`) or a getter
 *    (`() => T[]`), resolved with `toValue` (upstream: `RefOrValue`).
 *    When a ref-like list's `current` is replaced, the current index is
 *    re-applied to the new list (upstream: `watch(listRef, ...)`) — plain
 *    arrays and getters are simply re-resolved on every render instead.
 * 3. `next`/`prev`/`go` are stable callbacks that return the would-be value
 *    synchronously (upstream returns the new state from the `set` helper);
 *    the state commit itself is asynchronous (React `setState`).
 *
 * @example
 * const { state, next, prev, go } = useCycleList([
 *   'Dog', 'Cat', 'Lizard', 'Shark', 'Whale', 'Dolphin', 'Octopus', 'Seal',
 * ])
 *
 * state // 'Dog'
 * next() // 'Cat'
 * go(3) // 'Shark'
 */
export function useCycleList<T>(list: RefOrValue<T[]>, options?: UseCycleListOptions<T>): UseCycleListReturn<T> {
  // latest-value refs synced each render so every control below is a stable
  // callback that always reads the newest list and options
  const listRef = useRef(list)
  listRef.current = list
  const optionsRef = useRef(options)
  optionsRef.current = options
  const isListRefLikeRef = useRef(isRefLike(list))
  isListRefLikeRef.current = isRefLike(list)

  const getList = useCallback(() => toValue<T[]>(listRef.current), [])
  const getOptions = useCallback(() => optionsRef.current, [])

  // upstream: shallowRef(getInitialValue())
  const [state, setState] = useState<T>(() => {
    const options = getOptions()
    return (toValue(options?.initialValue ?? getList()[0]) ?? undefined) as T
  })

  // upstream: computed<number>({ get, set }) — derived from state + list on
  // every render; set(v) is `go`
  const computeIndex = useCallback((value: T): number => {
    const options = getOptions()
    const targetList = getList()
    let index = options?.getIndexOf
      ? options.getIndexOf(value, targetList)
      : targetList.indexOf(value)
    if (index < 0)
      index = options?.fallbackIndex ?? 0
    return index
  }, [getList, getOptions])

  const index = computeIndex(state)
  const indexRef = useRef(index)
  indexRef.current = index

  // upstream: set(i) — normalize the index modulo the list length, commit
  // the item at that position and return it
  const set = useCallback((i: number): T => {
    const targetList = getList()
    const length = targetList.length
    const normalized = (i % length + length) % length
    const value = targetList[normalized]
    setState(value)
    return value
  }, [getList])

  const shift = useCallback((delta = 1): T => set(indexRef.current + delta), [set])

  const next = useCallback((n = 1): T => shift(n), [shift])
  const prev = useCallback((n = 1): T => shift(-n), [shift])

  // upstream: index.value = v → set(v); functional updates resolve against
  // the latest rendered index
  const setIndex = useCallback((action: SetStateAction<number>) => {
    const resolved = typeof action === 'function' ? action(indexRef.current) : action
    set(resolved)
  }, [set])

  // upstream: watch(listRef, () => set(index.value)) — replacing the `current`
  // of a ref-like list re-applies the current index to the new list. Runs on
  // every render, no-op when the ref-like value did not change.
  const lastListValueRef = useRef<T[]>(getList())
  useEffect(() => {
    if (!isListRefLikeRef.current)
      return
    const current = getList()
    if (current !== lastListValueRef.current) {
      lastListValueRef.current = current
      set(indexRef.current)
    }
  })

  return { state, index, next, prev, go: set, setState, setIndex }
}
