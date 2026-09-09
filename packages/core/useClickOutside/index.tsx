import type { ConfigurableWindow, RefOrValue } from '@reaxuse/shared'
import { isIOS, noop, toValue } from '@reaxuse/shared'
import { useCallback, useEffect, useRef } from 'react'
import { useEventListener } from '../useEventListener'

export interface UseClickOutsideOptions extends ConfigurableWindow {
  /**
   * List of elements that should not trigger the event,
   * provided as elements (plain elements or ref-like `{ current }` objects)
   * or CSS Selectors.
   */
  ignore?: RefOrValue<(RefOrValue<Element | null> | string)[]>
  /**
   * Use capturing phase for the internal event listener.
   *
   * @default true
   */
  capture?: boolean
  /**
   * Run the handler function if focus moves to an iframe.
   *
   * @default false
   */
  detectIframe?: boolean
}

export type UseClickOutsideHandler = (event: PointerEvent | FocusEvent) => void

let _iOSWorkaround = false

/**
 * Listen for clicks outside of an element. Useful for modals or dropdowns.
 *
 * Map from @vueuse/core `onClickOutside`
 * (`source/vueuse/packages/core/onClickOutside/`). Attaches `click`,
 * `pointerdown` (and — when `detectIframe` is enabled — `blur`) listeners to
 * the window, and calls the handler when a click lands outside the resolved
 * `target` element. The `ignore` option suppresses the handler for matching
 * elements (elements or CSS selectors), `capture` controls the phase of the
 * internal `click` listener (default `true`), and `detectIframe` also fires
 * the handler when focus moves to an iframe.
 *
 * React divergences:
 * - React has no composable-function API, so this is a hook (upstream's
 *   `onClickOutside` is a plain function): the listeners bind in effects and
 *   are removed on unmount;
 * - the target resolves through `toValue` — a plain element or a ref-like
 *   `{ current }` object (e.g. a `useRef`) are both accepted;
 * - the `controls` option is dropped, so the return is always a single stop
 *   function (`() => void`) that removes all registered listeners (upstream
 *   also returns a `{ stop, cancel, trigger }` controls object);
 * - the target/handler/options are read through latest-value refs, so new
 *   inline targets or handlers never cause re-subscription — only changes to
 *   the resolved window, `capture` or the bound event options re-bind;
 * - SSR-safe: nothing touches `window` during render — the window target only
 *   resolves when `window` is defined and the listeners bind in the mount
 *   effects. The one-time iOS Safari click workaround also runs inside an
 *   effect instead of during setup.
 *
 * @see https://vueuse.org/core/onClickOutside/
 *
 * @example
 * const target = useRef<HTMLDivElement | null>(null)
 * useClickOutside(target, (event) => console.log(event))
 *
 * const stop = useClickOutside(target, handler)
 * stop()
 */
export function useClickOutside<T extends UseClickOutsideOptions>(
  target: RefOrValue<Element | null | undefined>,
  handler: UseClickOutsideHandler,
  options: T = {} as T,
): () => void {
  const {
    window: customWindow,
    ignore = [],
    capture = true,
    detectIframe = false,
  } = options

  const defaultWindow = typeof window === 'undefined' ? undefined : window
  const win = customWindow ?? defaultWindow

  // Latest-value refs synced every render, so the bound listeners always read
  // the newest target / handler / options without re-subscribing on identity.
  const targetRef = useRef(target)
  const handlerRef = useRef(handler)
  const ignoreRef = useRef(ignore)
  const winRef = useRef(win)
  const boolRef = useRef({ capture, detectIframe })
  targetRef.current = target
  handlerRef.current = handler
  ignoreRef.current = ignore
  winRef.current = win
  boolRef.current = { capture, detectIframe }

  const shouldListenRef = useRef(true)
  const isProcessingClickRef = useRef(false)

  // Fixes: https://github.com/vueuse/vueuse/issues/1520
  // How it works: https://stackoverflow.com/a/39712411
  // One-time workaround so iOS Safari fires `click` on any element. These
  // handlers must not be disposed — kept for the whole page lifetime.
  useEffect(() => {
    const currentWindow = winRef.current
    if (!currentWindow || !isIOS || _iOSWorkaround)
      return
    _iOSWorkaround = true
    const listenerOptions = { passive: true }
    Array.from(currentWindow.document.body.children)
      .forEach(el => el.addEventListener('click', noop, listenerOptions))
    currentWindow.document.documentElement.addEventListener('click', noop, listenerOptions)
  }, [])

  const shouldIgnore = (event: Event): boolean => {
    const currentWindow = winRef.current
    if (!currentWindow)
      return false
    return toValue(ignoreRef.current).some((item) => {
      if (typeof item === 'string') {
        return Array.from(currentWindow.document.querySelectorAll(item))
          .some(el => el === event.target || event.composedPath().includes(el))
      }
      const el = toValue(item) as Element | null | undefined
      return !!el && (event.target === el || event.composedPath().includes(el))
    })
  }

  const listener = (event: Event): void => {
    const el = toValue(targetRef.current) as Element | null | undefined

    if (event.target == null)
      return

    if (!el || el === event.target || event.composedPath().includes(el))
      return

    // `detail === 0` marks a click that was pre-filtered by the pointerdown
    // listener (e.g. one that hit an ignored element) — keep it ignored.
    if ('detail' in event && event.detail === 0)
      shouldListenRef.current = !shouldIgnore(event)

    if (!shouldListenRef.current) {
      shouldListenRef.current = true
      return
    }

    handlerRef.current(event as PointerEvent | FocusEvent)
  }

  const stopClick = useEventListener(
    win,
    'click',
    (event: Event) => {
      if (!isProcessingClickRef.current) {
        isProcessingClickRef.current = true
        setTimeout(() => {
          isProcessingClickRef.current = false
        }, 0)
        listener(event)
      }
    },
    { passive: true, capture },
  )

  const stopPointerDown = useEventListener(
    win,
    'pointerdown',
    (e: PointerEvent) => {
      const el = toValue(targetRef.current) as Element | null | undefined
      shouldListenRef.current = !shouldIgnore(e) && !!(el && !e.composedPath().includes(el))
    },
    { passive: true },
  )

  const stopBlur = useEventListener(
    win,
    'blur',
    (event: FocusEvent) => {
      // `detectIframe` is read through a ref so the listener stays registered
      // without violating react-hooks/rules-of-hooks (no conditional hooks).
      if (!boolRef.current.detectIframe)
        return
      setTimeout(() => {
        const currentWindow = winRef.current
        if (!currentWindow)
          return
        const el = toValue(targetRef.current) as Element | null | undefined
        let activeEl: Element | null | undefined = currentWindow.document.activeElement
        while (activeEl?.shadowRoot)
          activeEl = activeEl.shadowRoot.activeElement
        if (
          activeEl?.tagName === 'IFRAME'
          && !el?.contains(currentWindow.document.activeElement)
        ) {
          handlerRef.current(event as PointerEvent | FocusEvent)
        }
      }, 0)
    },
    { passive: true },
  )

  return useCallback(() => {
    stopClick?.()
    stopPointerDown?.()
    stopBlur?.()
  }, [stopClick, stopPointerDown, stopBlur])
}
