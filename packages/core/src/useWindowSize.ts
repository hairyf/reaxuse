import { useEffect, useState } from 'react'

/**
 * Specify a custom `window` instance, e.g. working with iframes or in
 * testing environments.
 */
interface ConfigurableWindow {
  window?: Window
}

export interface UseWindowSizeOptions extends ConfigurableWindow {
  initialWidth?: number
  initialHeight?: number
  /**
   * Listen to the `orientation: portrait` media-query change (upstream's
   * stand-in for the `orientationchange` event).
   *
   * @default true
   */
  listenOrientation?: boolean
  /**
   * Whether the scrollbar should be included in the width and height.
   * Only effective when `type` is `'inner'`.
   *
   * @default true
   */
  includeScrollbar?: boolean
  /**
   * Use `window.innerWidth` or `window.outerWidth` or `window.visualViewport`.
   *
   * @default 'inner'
   */
  type?: 'inner' | 'outer' | 'visual'
}

export interface UseWindowSizeReturn {
  width: number
  height: number
}

/**
 * React port of VueUse's `useWindowSize`. Reactive window size.
 *
 * Map from @vueuse/core `useWindowSize`
 * (`source/vueuse/packages/core/useWindowSize/`), which keeps `width` and
 * `height` shallow refs and refreshes them on window `resize` (plus the
 * `orientation: portrait` media query when `listenOrientation`, and the
 * `visualViewport` when `type: 'visual'`).
 *
 * React divergences:
 * - the Vue `ShallowRef` return becomes a plain `{ width, height }` state
 *   object, so the component re-renders on every size change;
 * - the initial `update()` and the listeners move into a self-contained
 *   `useEffect` (upstream uses `useEventListener` and calls `update()` during
 *   setup), so SSR renders the `initialWidth`/`initialHeight` defaults
 *   (`Number.POSITIVE_INFINITY`, matching upstream) without touching
 *   `window`;
 * - upstream's `useMediaQuery('(orientation: portrait)')` watch becomes a
 *   `matchMedia` `change` listener, guarded for environments without
 *   `matchMedia`.
 *
 * @example
 * const { width, height } = useWindowSize()
 */
export function useWindowSize(options: UseWindowSizeOptions = {}): UseWindowSizeReturn {
  const {
    initialWidth = Number.POSITIVE_INFINITY,
    initialHeight = Number.POSITIVE_INFINITY,
    listenOrientation = true,
    includeScrollbar = true,
    type = 'inner',
  } = options

  const [size, setSize] = useState<UseWindowSizeReturn>({ width: initialWidth, height: initialHeight })

  useEffect(() => {
    const win = options.window ?? (typeof window === 'undefined' ? undefined : window)
    if (!win)
      return

    const update = () => {
      if (type === 'outer') {
        setSize({ width: win.outerWidth, height: win.outerHeight })
      }
      else if (type === 'visual' && win.visualViewport) {
        const { width: viewportWidth, height: viewportHeight, scale } = win.visualViewport
        setSize({ width: Math.round(viewportWidth * scale), height: Math.round(viewportHeight * scale) })
      }
      else if (includeScrollbar) {
        setSize({ width: win.innerWidth, height: win.innerHeight })
      }
      else {
        setSize({ width: win.document.documentElement.clientWidth, height: win.document.documentElement.clientHeight })
      }
    }

    update()

    const listeners: Array<() => void> = []
    const listen = (target: EventTarget, event: string, handler: () => void) => {
      target.addEventListener(event, handler, { passive: true })
      listeners.push(() => target.removeEventListener(event, handler))
    }

    listen(win, 'resize', update)

    if (type === 'visual' && win.visualViewport)
      listen(win.visualViewport, 'resize', update)

    if (listenOrientation && typeof win.matchMedia === 'function') {
      const orientationMedia = win.matchMedia('(orientation: portrait)')
      listen(orientationMedia, 'change', update)
    }

    return () => {
      listeners.forEach(remove => remove())
    }
  }, [options.window, type, includeScrollbar, listenOrientation])

  return size
}
