import type { State } from '@reaxuse/shared'
import { clamp, toValue, useControllableState } from '@reaxuse/shared'
import { useCallback } from 'react'

/**
 * Reactively clamp a value between two other values.
 *
 * Map from @vueuse/math `useClamp`
 * (`source/vueuse/packages/math/useClamp/`). React port of VueUse's writable
 * `useClamp` — returns a `[value, setValue]` tuple whose setter clamps on
 * write. `value`, `min` and `max` all accept a React `State<number>` — a plain
 * number, a getter (`() => value`), a React ref (`{ current }`), a
 * `[value, setter]` tuple, or a `{ value, onChange }` pair — resolved on every
 * render. Bounds are re-resolved on
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
 * @param value - The value to clamp (a React `State<number>`).
 * @param min - The lower bound (a React `State<number>`).
 * @param max - The upper bound (a React `State<number>`).
 * @returns A `[value, setValue]` pair; `setValue` clamps into `[min, max]`.
 */
export function useClamp(
  value: State<number>,
  min: State<number>,
  max: State<number>,
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
