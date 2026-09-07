import type { ConfigurableWindow } from '@reaxuse/shared'
import { useEffect, useState } from 'react'

export interface UseDevicePixelRatioOptions extends ConfigurableWindow {
}

export interface UseDevicePixelRatioReturn {
  pixelRatio: number
}

/**
 * React port of VueUse's `useDevicePixelRatio`. Reactively track
 * `window.devicePixelRatio`.
 *
 * Map from @vueuse/core `useDevicePixelRatio`
 * (`source/vueuse/packages/core/useDevicePixelRatio/`), which keeps a
 * `shallowRef(1)` updated by a `watchImmediate` over a
 * `useMediaQuery('(resolution: N dppx)')` — when the resolution media query
 * stops matching, the real `window.devicePixelRatio` is read into the ref,
 * which re-writes the query string so it always targets the current
 * resolution.
 *
 * React divergences:
 * - the Vue `shallowRef`/`watchImmediate` pair becomes a plain number state
 *   updated inside a self-contained `useEffect` that (re)subscribes a
 *   `matchMedia('(resolution: N dppx)')` `change` listener; the effect
 *   re-runs whenever `pixelRatio` changes so the query always matches the
 *   current resolution (mirroring upstream's reactive query string);
 * - SSR renders the `1` initial value (matching upstream's `shallowRef(1)`)
 *   without touching `window`; the real value is read on mount;
 * - upstream's `stop` handle and `noop` fallback are dropped — listeners are
 *   cleaned up by the effect itself.
 *
 * @example
 * const { pixelRatio } = useDevicePixelRatio()
 */
export function useDevicePixelRatio(options: UseDevicePixelRatioOptions = {}): UseDevicePixelRatioReturn {
  const [pixelRatio, setPixelRatio] = useState(1)

  useEffect(() => {
    const win = options.window ?? (typeof window === 'undefined' ? undefined : window)
    if (!win || typeof win.matchMedia !== 'function')
      return

    // upstream `watchImmediate`: sync the real ratio on every (re)subscribe
    setPixelRatio(win.devicePixelRatio)

    const mediaQuery = win.matchMedia(`(resolution: ${pixelRatio}dppx)`)
    const update = () => setPixelRatio(win.devicePixelRatio)
    mediaQuery.addEventListener('change', update, { passive: true })

    return () => {
      mediaQuery.removeEventListener('change', update)
    }
  }, [pixelRatio, options.window])

  return { pixelRatio }
}
