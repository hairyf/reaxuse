import type { ConfigurableWindow } from '@reaxuse/shared'
import { useEffect, useRef, useState } from 'react'

export interface UseActiveElementOptions extends ConfigurableWindow {
  /**
   * Custom `document` or open `ShadowRoot` to read `activeElement` from, e.g.
   * working with iframes or in testing environments (upstream:
   * `ConfigurableDocumentOrShadowRoot`). Inlined here —
   * `ConfigurableDocument` is not ported to `@reaxuse/shared`, so `document?`
   * mirrors the option `useDocumentVisibility` exposes.
   *
   * @default the resolved `window`'s `document` on the client
   */
  document?: Document | ShadowRoot
  /**
   * Search active element deeply inside shadow DOM
   *
   * @default true
   */
  deep?: boolean
  /**
   * Track the active element when it is removed from the DOM. Uses a
   * `MutationObserver` under the hood.
   *
   * @default false
   */
  triggerOnRemoval?: boolean
}

/**
 * React port of VueUse's `useActiveElement`.
 *
 * Map from @vueuse/core `useActiveElement`
 * (`source/vueuse/packages/core/useActiveElement/`). Reactively track
 * `document.activeElement` — the focused element, falling back to
 * `document.body` when nothing is focused — re-reading it when focus changes,
 * the window loses focus, or a pointer is pressed (`deep`, default `true`,
 * descends into open shadow roots). The Vue `ShallowRef` return becomes a
 * plain `T | undefined` state value.
 *
 * React divergences:
 * - the Vue `ShallowRef<T | null | undefined>` return becomes a plain
 *   `T | undefined` value — `undefined` wherever upstream would hold `null`
 *   (e.g. nothing focused inside a shadow root);
 * - the `focus` / `blur` / `pointerdown` listeners (upstream composes
 *   `useEventListener`) attach in an effect and are removed on unmount.
 *   `pointerdown` is kept as an additional trigger for environments where
 *   `activeElement` changes without a `focus` event — the current upstream
 *   relies on `focus` / `blur` alone (the listener, in `{ capture: true,
 *   passive: true }`, mirrors upstream);
 * - the `blur` handler re-reads only when `event.relatedTarget === null`, so
 *   focus moving inside the page is handled by the `focus` listener, exactly
 *   as upstream;
 * - the initial `document.activeElement` read happens in the mount effect
 *   instead of during setup, so SSR renders `undefined` without touching
 *   `window` or the DOM;
 * - `triggerOnRemoval` (upstream composes `onElementRemoval`, which wraps
 *   `useMutationObserver`) observes the resolved `document` / `shadowRoot`
 *   directly and re-triggers when the tracked element is removed from the
 *   tree, disconnecting the observer on unmount.
 *
 * SSR-safe: nothing touches `window` or the DOM during render — all reads
 * happen in effects.
 *
 * @see https://vueuse.org/core/useActiveElement/
 * @param options - UseActiveElementOptions
 *
 * @example
 * const activeElement = useActiveElement()
 * // re-renders when focus moves to another element
 */
export function useActiveElement<T extends HTMLElement = HTMLElement>(
  options: UseActiveElementOptions = {},
): T | undefined {
  const { deep = true, triggerOnRemoval = false } = options
  const [activeElement, setActiveElement] = useState<T | undefined>(undefined)

  // Latest tracked element, so the `triggerOnRemoval` observer can check the
  // removal of the currently active element without re-binding on each focus
  // change (upstream: the `watchEffect` over the active element ref).
  const activeElementRef = useRef<T | undefined>(undefined)

  useEffect(() => {
    const win = options.window ?? (typeof window === 'undefined' ? undefined : window)
    const doc = options.document ?? win?.document
    if (!doc || !win)
      return

    const getDeepActiveElement = (): T | undefined => {
      let element = doc.activeElement as T | null | undefined
      if (deep) {
        while (element?.shadowRoot)
          element = element.shadowRoot?.activeElement as T | null | undefined
      }
      return element ?? undefined
    }

    const trigger = () => {
      const element = getDeepActiveElement()
      activeElementRef.current = element
      setActiveElement(element)
    }

    const listenerOptions: AddEventListenerOptions = { capture: true, passive: true }
    const onBlur = (event: FocusEvent) => {
      if (event.relatedTarget !== null)
        return
      trigger()
    }
    const onFocus = () => trigger()
    const onPointerDown = () => trigger()

    win.addEventListener('blur', onBlur, listenerOptions)
    win.addEventListener('focus', onFocus, listenerOptions)
    win.addEventListener('pointerdown', onPointerDown, listenerOptions)

    let observer: MutationObserver | null = null
    if (triggerOnRemoval && 'MutationObserver' in win) {
      const winWithObserver = win as unknown as { MutationObserver: typeof MutationObserver }
      observer = new winWithObserver.MutationObserver((mutations) => {
        const element = activeElementRef.current
        if (!element)
          return
        const targetRemoved = mutations
          .flatMap(mutation => [...mutation.removedNodes])
          .some(node => node === element || node.contains(element))
        if (targetRemoved)
          trigger()
      })
      observer.observe(doc, { childList: true, subtree: true })
    }

    trigger()

    return () => {
      win.removeEventListener('blur', onBlur, { capture: true })
      win.removeEventListener('focus', onFocus, { capture: true })
      win.removeEventListener('pointerdown', onPointerDown, { capture: true })
      observer?.disconnect()
    }
  }, [options.window, options.document, deep, triggerOnRemoval])

  return activeElement
}
