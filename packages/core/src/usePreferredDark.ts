import type { ConfigurableWindow } from '@reaxuse/shared'
import { useEffect, useState } from 'react'

/**
 * React port of VueUse's `usePreferredDark`.
 *
 * Map from @vueuse/core `usePreferredDark`
 * (`source/vueuse/packages/core/usePreferredDark/`), which composes
 * `useMediaQuery('(prefers-color-scheme: dark)')` and returns the matched
 * ref. Reactive [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
 * `dark` preference as a plain boolean — `true` when the user prefers a
 * dark theme.
 *
 * React divergences:
 * - the Vue `computed<boolean>` return becomes `useState(false)`-backed
 *   plain boolean state, so components re-render on media query changes;
 * - the `matchMedia` query and its `change` listener attach inside a
 *   self-contained `useEffect` (upstream binds through `useMediaQuery` +
 *   `useEventListener`) and are removed on unmount;
 * - the initial `matchMedia().matches` sync happens in the mount effect
 *   instead of during setup, so SSR renders the `false` default without
 *   touching `window` (matching upstream's initial value, where the media
 *   query ref starts `false`).
 *
 * @example
 * const isDark = usePreferredDark()
 */
export function usePreferredDark(options: ConfigurableWindow = {}): boolean {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const win = options.window ?? (typeof window === 'undefined' ? undefined : window)
    if (!win || typeof win.matchMedia !== 'function')
      return

    const query = win.matchMedia('(prefers-color-scheme: dark)')
    const update = (event: MediaQueryListEvent) => {
      setIsDark(event.matches)
    }

    setIsDark(query.matches)
    query.addEventListener('change', update, { passive: true })

    return () => {
      query.removeEventListener('change', update)
    }
  }, [options.window])

  return isDark
}
