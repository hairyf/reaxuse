import type { ConfigurableWindow } from '@reaxuse/shared'
import { useEffect, useState } from 'react'

/**
 * React port of VueUse's `usePageLeave`.
 *
 * Map from @vueuse/core `usePageLeave`
 * (`source/vueuse/packages/core/usePageLeave/`). Reactive state showing
 * whether the mouse has left the page, as a plain boolean — `true` when the
 * pointer exits the window/document boundary, `false` otherwise.
 *
 * React divergences:
 * - the Vue `ShallowRef<boolean>` return becomes a plain boolean state;
 * - the `mouseout`/`mouseleave`/`mouseenter` listeners live in a
 *   self-contained `useEffect` (upstream composes `useEventListener`) and
 *   are removed on unmount;
 * - the handler reads `event.relatedTarget`/`event.toElement` directly — the
 *   legacy `window.event` fallback is dropped since the DOM always passes
 *   the event object to the listener.
 *
 * @example
 * const isLeft = usePageLeave()
 */
export function usePageLeave(options: ConfigurableWindow = {}): boolean {
  const [isLeft, setIsLeft] = useState(false)

  useEffect(() => {
    const win = options.window ?? (typeof window === 'undefined' ? undefined : window)
    if (!win)
      return

    const handler = (event: MouseEvent) => {
      const from = event.relatedTarget || (event as MouseEvent & { toElement?: EventTarget | null }).toElement
      setIsLeft(!from)
    }
    const listenerOptions = { passive: true }

    win.addEventListener('mouseout', handler, listenerOptions)
    win.document.addEventListener('mouseleave', handler, listenerOptions)
    win.document.addEventListener('mouseenter', handler, listenerOptions)

    return () => {
      win.removeEventListener('mouseout', handler)
      win.document.removeEventListener('mouseleave', handler)
      win.document.removeEventListener('mouseenter', handler)
    }
  }, [options.window])

  return isLeft
}
