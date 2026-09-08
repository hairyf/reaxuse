import type { Dispatch, SetStateAction } from 'react'
import type { RefOrValue } from './utils'
import { useCallback, useRef, useState } from 'react'
import { isRefLike, toValue } from './utils'

export type UseStateDefaultReturn<T = any> = [
  /**
   * Current value — the source's current value, or `defaultValue` when the
   * source is `null`/`undefined`.
   */
  value: T,
  /**
   * Setter to update the value (value or updater form, like `setState`) —
   * writes through to the source's `current`.
   */
  setValue: Dispatch<SetStateAction<T | undefined | null>>,
]

/**
 * Apply default value to a ref-like source — React port of VueUse's
 * `refDefault` renamed to `useStateDefault` (this repo's naming for the
 * `ref*` family; upstream's single writable computed ref becomes a tuple).
 *
 * Map from @vueuse/shared `refDefault`
 * Mapping: upstream derives a writable `computed` from a source
 * `Ref<T | undefined | null>` — it reads `source.value ?? defaultValue` and
 * writes back to `source.value`. This port keeps the source as an
 * externally-controlled ref-like object (`{ current }`, e.g. the first tuple
 * element of `useStorage`) and returns the React tuple
 * `const [value, setValue] = useStateDefault(raw, 'default')`. `value` is
 * derived on every render from the source through `toValue` (`source.current
 * ?? defaultValue`), so it always reflects the source's current value —
 * including writes made from outside the component; `setValue` resolves the
 * next value (value or updater form), writes it through to `source.current` if
 * the source is ref-like and bumps a local version counter so the derived
 * `value` re-renders. SSR-safe: nothing touches the DOM and the first server
 * render already shows the default.
 *
 * @param source       The source ref-like object (`{ current }`) holding a
 *                     `T | undefined | null` value — read through `toValue` on
 *                     every render and written back to `current` on `setValue`.
 * @param defaultValue The value displayed while the source is `null` or
 *                     `undefined`.
 * @return  A tuple `[value, setValue]` — the current value (source value or
 *          `defaultValue`) and its setter.
 *
 * @example
 * const raw = { current: undefined as string | undefined }
 * const [value, setValue] = useStateDefault(raw, 'default')
 *
 * setValue('hello')
 * console.log(value) // 'hello'
 *
 * setValue(undefined)
 * console.log(value) // 'default'
 */
export function useStateDefault<T = any>(
  source: RefOrValue<T | undefined | null>,
  defaultValue: T,
): UseStateDefaultReturn<T> {
  // keep the latest source behind the stable setter — the source object may be
  // swapped between renders (e.g. a fresh `{ current }` on every render)
  const sourceRef = useRef(source)
  sourceRef.current = source

  // local version counter only — `value` itself is derived from `source` on
  // every render (upstream: a computed over the source ref)
  const [, setVersion] = useState(0)
  const bump = () => {
    setVersion(current => current + 1)
  }

  const setValue = useCallback<Dispatch<SetStateAction<T | undefined | null>>>((next) => {
    const current = toValue(sourceRef.current)
    const resolved = typeof next === 'function'
      ? (next as (prev: T | undefined | null) => T | undefined | null)(current)
      : next
    // upstream: `set(value) { source.value = value }` — write through to the
    // ref-like source so external readers see the update
    if (isRefLike(sourceRef.current))
      sourceRef.current.current = resolved
    bump()
  }, [])

  return [toValue(source) ?? defaultValue, setValue]
}
