import { useEffect, useState } from 'react'

/**
 * Specify a custom `window` instance, e.g. working with iframes or in
 * testing environments.
 *
 * Mirrors the `ConfigurableWindow` interface declared in `useOnline` —
 * declared locally (not exported) to avoid an ambiguous `export *` clash
 * in the package barrel.
 */
interface ConfigurableWindow {
  window?: Window
}

/**
 * React port of VueUse's `useWindowFocus`.
 *
 * Map from @vueuse/core `useWindowFocus`
 * (`source/vueuse/packages/core/useWindowFocus/`). Reactively track window
 * focus with `window.onfocus` and `window.onblur`. Focus state as a plain
 * boolean — `true` on the window `focus` event, `false` on `blur`.
 *
 * React divergences:
 * - the Vue `ShallowRef<boolean>` return becomes a plain boolean state;
 * - the `focus`/`blur` listeners live in a self-contained `useEffect`
 *   (upstream composes `useEventListener`) and are removed on unmount;
 * - the initial `document.hasFocus()` sync happens in the mount effect
 *   instead of during setup, so SSR renders the `false` default without
 *   touching `window.document` (matching upstream's no-window value).
 *
 * @example
 * const focused = useWindowFocus()
 */
export function useWindowFocus(options: ConfigurableWindow = {}): boolean {
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const win = options.window ?? (typeof window === 'undefined' ? undefined : window)
    if (!win)
      return

    setFocused(win.document.hasFocus())

    const onFocus = () => setFocused(true)
    const onBlur = () => setFocused(false)
    win.addEventListener('focus', onFocus, { passive: true })
    win.addEventListener('blur', onBlur, { passive: true })

    return () => {
      win.removeEventListener('focus', onFocus)
      win.removeEventListener('blur', onBlur)
    }
  }, [options.window])

  return focused
}
