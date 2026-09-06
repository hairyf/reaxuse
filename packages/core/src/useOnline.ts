import { useEffect, useState } from 'react'

/**
 * Specify a custom `window` instance, e.g. working with iframes or in
 * testing environments.
 */
export interface ConfigurableWindow {
  window?: Window
}

/**
 * React port of VueUse's `useOnline`.
 *
 * Map from @vueuse/core `useOnline`
 * (`source/vueuse/packages/core/useOnline/`), which composes `useNetwork`
 * and returns its `isOnline` ref. Reactive online state as a plain boolean —
 * `true` while the browser reports a network connection.
 *
 * React divergences:
 * - the Vue `isOnline` ref return becomes a plain boolean state;
 * - the window `online`/`offline` listeners live in a self-contained
 *   `useEffect` (upstream uses `useEventListener`) and are removed on
 *   unmount;
 * - the initial `navigator.onLine` sync happens in the mount effect instead
 *   of during setup, so SSR renders the `true` default without touching
 *   `navigator` (matching upstream's initial value).
 *
 * @example
 * const online = useOnline()
 */
export function useOnline(options: ConfigurableWindow = {}): boolean {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const win = options.window ?? (typeof window === 'undefined' ? undefined : window)
    if (!win)
      return

    setOnline(win.navigator.onLine)

    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    win.addEventListener('online', goOnline, { passive: true })
    win.addEventListener('offline', goOffline, { passive: true })

    return () => {
      win.removeEventListener('online', goOnline)
      win.removeEventListener('offline', goOffline)
    }
  }, [options.window])

  return online
}
