import type { MaybeRefOrGetter } from '@reaxuse/shared'
import { clamp, isRefLike, toValue } from '@reaxuse/shared'
import { useCallback, useReducer, useState } from 'react'

/**
 * Reactively clamp a value between two other values.
 *
 * Map from @vueuse/math `useClamp`
 * (`source/vueuse/packages/math/useClamp/`). React port of VueUse's writable
 * `useClamp` — returns a `[value, setValue]` tuple whose setter clamps on
 * write. `value`, `min` and `max` accept plain numbers, `{ current }` ref-like
 * objects or getters (resolved on every render). Bounds are re-resolved on
 * every render and on every set, so shrinking `max` / raising `min` re-clamps
 * the current value automatically. Getter and ref-like value inputs are tracked
 * on each render (mirroring upstream's `computed` branches); ref-like inputs
 * are written back to when clamped, exactly like upstream's writable computed.
 *
 * @__NO_SIDE_EFFECTS__
 *
 * @example
 * const [value, setValue] = useClamp(0, 0, 10)
 * setValue(15) // value is 10
 * setValue(-5) // value is 0
 *
 * @param value - The value to clamp (plain number, `{ current }` ref-like or getter).
 * @param min - The lower bound (plain number, `{ current }` ref-like or getter).
 * @param max - The upper bound (plain number, `{ current }` ref-like or getter).
 * @returns A `[value, setValue]` pair; `setValue` clamps into `[min, max]`.
 */
export function useClamp(
  value: MaybeRefOrGetter<number>,
  min: MaybeRefOrGetter<number>,
  max: MaybeRefOrGetter<number>,
): [number, (value: number) => void] {
  const [raw, setRaw] = useState(() => toValue(value))
  const [, forceRender] = useReducer((count: number) => count + 1, 0)

  // Plain numbers are owned by internal state; getter / ref-like inputs are
  // caller-owned and re-resolved on every render (upstream's computed branches).
  const current = clamp(
    typeof value === 'function' || isRefLike(value) ? toValue(value) : raw,
    toValue(min),
    toValue(max),
  )

  // Mirror upstream: the getter of the writable computed writes the clamped
  // value back into the source ref so it stays within bounds even when the
  // bounds themselves change.
  if (isRefLike(value) && value.current !== current)
    value.current = current

  const setValue = useCallback((next: number) => {
    const clamped = clamp(next, toValue(min), toValue(max))
    setRaw(clamped)
    if (isRefLike(value)) {
      value.current = clamped
      forceRender()
    }
  }, [value, min, max])

  return [current, setValue]
}
