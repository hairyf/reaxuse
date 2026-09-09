import type { RefOrValue, State } from '@reaxuse/shared'
import { clamp, toValue, useControllableState } from '@reaxuse/shared'
import { useCallback } from 'react'

/**
 * Reactively clamp a value between two other values.
 *
 * Map from @vueuse/math `useClamp`
 * (`source/vueuse/packages/math/useClamp/`). React port of VueUse's writable
 * `useClamp` — returns a `[value, setValue]` tuple whose setter clamps on
 * write. `value`, `min` and `max` accept plain numbers or React refs (resolved
 * on every render). Bounds are re-resolved on
 * every render and on every set, so shrinking `max` / raising `min` re-clamps
 * the current value automatically. Ref-like value inputs are tracked
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
 * @param value - The value to clamp (a plain number, getter, controllable tuple, or `{ value, onChange }`).
 * @param min - The lower bound (a plain number or a React ref).
 * @param max - The upper bound (a plain number or a React ref).
 * @returns A `[value, setValue]` pair; `setValue` clamps into `[min, max]`.
 */
export function useClamp(
  value: State<number>,
  min: RefOrValue<number>,
  max: RefOrValue<number>,
): [number, (value: number) => void] {
  const [raw, setRaw] = useControllableState(value, { passive: true })

  const current = clamp(raw, toValue(min), toValue(max))

  // Mirror upstream: the writable computed writes the clamped value back into
  // the source ref so it stays within bounds even when the
  // bounds themselves change.
  const setValue = useCallback((next: number) => {
    setRaw(clamp(next, toValue(min), toValue(max)))
  }, [setRaw, min, max])

  return [current, setValue]
}
