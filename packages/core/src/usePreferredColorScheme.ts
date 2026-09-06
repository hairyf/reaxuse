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

export type ColorSchemeType = 'dark' | 'light' | 'no-preference'

/**
 * React port of VueUse's `usePreferredColorScheme`.
 *
 * Map from @vueuse/core `usePreferredColorScheme`
 * (`source/vueuse/packages/core/usePreferredColorScheme/`), which composes
 * `useMediaQuery('(prefers-color-scheme: light)')` and
 * `useMediaQuery('(prefers-color-scheme: dark)')` and maps the two matched
 * refs through `computed` to a string. Reactive
 * [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
 * media query as a plain string — `'dark'`, `'light'` or `'no-preference'`.
 *
 * React divergences:
 * - the Vue `computed<ColorSchemeType>` return becomes a plain string
 *   derived from two `useState(false)`-backed booleans (one per query), so
 *   components re-render on media query changes;
 * - both `matchMedia` queries and their `change` listeners attach inside a
 *   self-contained `useEffect` (upstream binds through `useMediaQuery` +
 *   `useEventListener`) and are all removed on unmount;
 * - the initial `matches` sync happens in the mount effect instead of
 *   during setup, so SSR renders the `'no-preference'` default without
 *   touching `window` (matching upstream's initial value, where both media
 *   query refs start `false`).
 *
 * @example
 * const colorScheme = usePreferredColorScheme() // 'dark' | 'light' | 'no-preference'
 */
export function usePreferredColorScheme(options: ConfigurableWindow = {}): ColorSchemeType {
  const [isLight, setIsLight] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const win = options.window ?? (typeof window === 'undefined' ? undefined : window)
    if (!win || typeof win.matchMedia !== 'function')
      return

    const lightQuery = win.matchMedia('(prefers-color-scheme: light)')
    const darkQuery = win.matchMedia('(prefers-color-scheme: dark)')
    const updateLight = (event: MediaQueryListEvent) => setIsLight(event.matches)
    const updateDark = (event: MediaQueryListEvent) => setIsDark(event.matches)

    setIsLight(lightQuery.matches)
    setIsDark(darkQuery.matches)

    lightQuery.addEventListener('change', updateLight, { passive: true })
    darkQuery.addEventListener('change', updateDark, { passive: true })

    return () => {
      lightQuery.removeEventListener('change', updateLight)
      darkQuery.removeEventListener('change', updateDark)
    }
  }, [options.window])

  if (isDark)
    return 'dark'
  if (isLight)
    return 'light'
  return 'no-preference'
}
