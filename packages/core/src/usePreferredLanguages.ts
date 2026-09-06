import { useEffect, useState } from 'react'

/**
 * Specify a custom `window` instance, e.g. working with iframes or in
 * testing environments.
 *
 * Declared locally and intentionally not exported — `useOnline` already
 * exports its own `ConfigurableWindow` and the barrel re-exports both
 * modules, so a second export would collide (TS2308).
 */
interface ConfigurableWindow {
  window?: Window
}

/**
 * Reactive Navigator Languages.
 *
 * Map from @vueuse/core `usePreferredLanguages`
 * (`source/vueuse/packages/core/usePreferredLanguages/`), which returns a
 * shallow ref of `navigator.languages` kept fresh by a `languagechange`
 * listener. Reactive preferred languages as a plain `readonly string[]`.
 *
 * React divergences:
 * - the Vue `ShallowRef<readonly string[]>` return becomes plain string-array
 *   state, so the component re-renders when the languages change;
 * - the `languagechange` listener lives in a self-contained `useEffect`
 *   (upstream uses `useEventListener`) and is removed on unmount;
 * - the initial `navigator.languages` sync happens in the mount effect
 *   instead of during setup, so SSR renders the upstream `['en']` fallback
 *   without touching `navigator`.
 *
 * @see https://vueuse.org/core/usePreferredLanguages/
 * @param options
 *
 * @example
 * const languages = usePreferredLanguages()
 */
export function usePreferredLanguages(options: ConfigurableWindow = {}): readonly string[] {
  const [languages, setLanguages] = useState<readonly string[]>(() => ['en'])

  useEffect(() => {
    const win = options.window ?? (typeof window === 'undefined' ? undefined : window)
    if (!win)
      return

    setLanguages(win.navigator.languages)

    const sync = () => setLanguages(win.navigator.languages)
    win.addEventListener('languagechange', sync, { passive: true })

    return () => {
      win.removeEventListener('languagechange', sync)
    }
  }, [options.window])

  return languages
}
