import type { ConfigurableWindow } from '@reaxuse/shared'
import { useEffect, useState } from 'react'

export type ReducedTransparencyType = 'reduce' | 'no-preference'

/**
 * React port of VueUse's `usePreferredReducedTransparency`.
 *
 * Map from @vueuse/core `usePreferredReducedTransparency`
 * (`source/vueuse/packages/core/usePreferredReducedTransparency/`), which
 * composes `useMediaQuery('(prefers-reduced-transparency: reduce)')` and
 * maps the matched ref to a string. Reactive
 * [prefers-reduced-transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency)
 * media query as a plain string — `'reduce'` or `'no-preference'`.
 *
 * React divergences:
 * - the Vue `computed<ReducedTransparencyType>` return becomes a plain
 *   string derived from `useState`-backed state, so components re-render
 *   on media query changes;
 * - the `matchMedia` query and its `change` listener attach inside a
 *   self-contained `useEffect` (upstream binds through `useMediaQuery` +
 *   `useEventListener`) and are removed on unmount;
 * - the initial `matchMedia().matches` sync happens in the mount effect
 *   instead of during setup, so SSR renders the `'no-preference'` default
 *   without touching `window` (matching upstream's initial value, where
 *   the media query ref starts `false`).
 *
 * @example
 * const transparency = usePreferredReducedTransparency()
 */
export function usePreferredReducedTransparency(options: ConfigurableWindow = {}): ReducedTransparencyType {
  const [isReduced, setIsReduced] = useState(false)

  useEffect(() => {
    const win = options.window ?? (typeof window === 'undefined' ? undefined : window)
    if (!win || typeof win.matchMedia !== 'function')
      return

    const query = win.matchMedia('(prefers-reduced-transparency: reduce)')
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
