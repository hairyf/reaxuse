import { useEffect, useMemo, useRef } from 'react'

export interface UseWatchCallback<T = any> {
  (value: T, oldValue: T): void
}

export interface UseWatchOptions {
  immediate?: boolean
}

/**
 * React port of VueUse's `watch`.
 *
 * Mapping: Vue's reactive `watch` → a `useEffect` keyed on the source; old
 * value tracking (VueUse's `usePrevious` equivalent) is done inline with a
 * `useRef` so the callback receives `(newValue, oldValue)`.
 *
 * The callback does NOT fire on the first render, unless `{ immediate: true }`
 * is passed (in which case it fires once with `oldValue` being `undefined`).
 *
 * Array/tuple sources are watched element-wise: the callback fires when any
 * element changes, and receives `[...T]` values.
 *
 * @example
 * useWatch(count, (value, oldValue) => {
 *   console.log(`count changed: ${oldValue} → ${value}`)
 * })
 *
 * @example
 * useWatch([a, b], ([a, b], [oldA, oldB]) => {
 *   console.log('a or b changed', oldA, oldB)
 * }, { immediate: true })
 */
export function useWatch<T>(
  source: T extends readonly any[] ? readonly [...T] : T,
  callback: UseWatchCallback<T extends readonly any[] ? [...T] : T>,
  options: UseWatchOptions = {},
): void {
  // Loosen inside the hook body: the public signature is conditional but the
  // implementation only needs the plain value/array shapes.
  const src: any = source
  const cb: UseWatchCallback = callback

  const firstUpdate = useRef(false)
  const then = useRef<Promise<any>>(undefined)
  // Inline old-value tracking (hairylib imports usePrevious here; reaxuse
  // implements it with a ref instead to avoid an extra hook dependency).
  const oldValue = useRef<any>(undefined)
  const deps = useMemo(
    () => (Array.isArray(src) ? src : [src]),
    [src],
  )

  useEffect(() => {
    const prev = oldValue.current
    if (!firstUpdate.current)
      recordFirst(prev)
    else
      cb(src, prev)
    oldValue.current = src
  }, deps)

  async function recordFirst(prev: any) {
    if (then.current)
      return
    then.current = Promise.resolve(src)
    then.current.then(() => {
      firstUpdate.current = true
    })
    if (options.immediate)
      then.current.then(value => cb(value, prev))
  }
}
