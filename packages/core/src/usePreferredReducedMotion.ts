import { useEffect, useState } from 'react'

/**
 * Specify a custom `window` instance, e.g. working with iframes or in
 * testing environments.
 *
 * Declared locally (not exported) — `useOnline` already exports the
 * identical interface and the barrel re-exports both modules, so a second
 * export would collide (TS2308).
 */
interface ConfigurableWindow {
  window?: Window
}

export type ReducedMotionType = 'reduce' | 'no-preference'

/**
 * React port of VueUse's `usePreferredReducedMotion`.
 *
 * Map from @vueuse/core `usePreferredReducedMotion`
 * (`source/vueuse/packages/core/usePreferredReducedMotion/`), which composes
 * `useMediaQuery('(prefers-reduced-motion: reduce)')` and maps the matched
 * ref to a string. Reactive
 * [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
 * media query as a plain string — `'reduce'` or `'no-preference'`.
 *
 * React divergences:
 * - the Vue `computed<ReducedMotionType>` return becomes a plain string
 *   derived from `useState`-backed state, so components re-render on media
 *   query changes;
 * - the `matchMedia` query and its `change` listener attach inside a
 *   self-contained `useEffect` (upstream binds through `useMediaQuery` +
 *   `useEventListener`) and are removed on unmount;
 * - the initial `matchMedia().matches` sync happens in the mount effect
 *   instead of during setup, so SSR renders the `'no-preference'` default
 *   without touching `window` (matching upstream's initial value, where
 *   the media query ref starts `false`).
 *
 * @example
 * const motion = usePreferredReducedMotion()
 */
export function usePreferredReducedMotion(options: ConfigurableWindow = {}): ReducedMotionType {
  const [isReduced, setIsReduced] = useState(false)

  useEffect(() => {
    const win = options.window ?? (typeof window === 'undefined' ? undefined : window)
    if (!win || typeof win.matchMedia !== 'function')
      return

    const query = win.matchMedia('(prefers-reduced-motion: reduce)')
    const update = (event: MediaQueryListEvent) => {
      setIsReduced(event.matches)
    }

    setIsReduced(query.matches)
    query.addEventListener('change', update, { passive: true })

    return () => {
      query.removeEventListener('change', update)
    }
  }, [options.window])

  return isReduced ? 'reduce' : 'no-preference'
}
