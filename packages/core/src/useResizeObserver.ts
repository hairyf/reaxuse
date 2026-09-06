import type { ConfigurableWindow } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Element types accepted as observation targets. Upstream's `MaybeElement`
 * also includes Vue component instances (`VueInstance`) — React refs hold
 * DOM nodes directly, so there is no equivalent here.
 */
export type MaybeElement = HTMLElement | SVGElement | undefined | null

/**
 * A plain element, a React ref object (`{ current }`), or a getter returning
 * one — the React equivalent of Vue's `MaybeRefOrGetter<T>`.
 */
export type MaybeComputedElementRef<T extends MaybeElement = MaybeElement>
  = | T
    | { readonly current: T }
    | (() => T)

/**
 * A single target, an array of targets, or a getter returning an array (or
 * `null`) — mirrors upstream's `MaybeComputedElementRefOrArray`.
 */
export type MaybeComputedElementRefOrArray<T extends MaybeElement = MaybeElement>
  = | MaybeComputedElementRef<T>
    | MaybeComputedElementRef<T>[]
    | (() => T[] | null)

/**
 * Options for `useResizeObserver`: passthrough of the platform
 * `ResizeObserverOptions` (e.g. `box`) plus a custom `window` instance, e.g.
 * working with iframes or in testing environments.
 */
export interface UseResizeObserverOptions extends ResizeObserverOptions, ConfigurableWindow {}

/**
 * Return of `useResizeObserver`. Upstream extends `Supportable` with a
 * `ComputedRef<boolean>`; the React port exposes a plain `boolean` state.
 */
export interface UseResizeObserverReturn {
  /**
   * Whether the current environment supports the `ResizeObserver` API.
   * Starts `false` and settles in a mount effect (SSR-safe).
   */
  isSupported: boolean
  /**
   * Disconnect the observer and stop tracking target changes. Calling it
   * again is a no-op — the hook does not restart after `stop()`.
   */
  stop: () => void
}

/**
 * React equivalent of upstream's `unrefElement`: resolves a getter, a
 * ref-like object, or a plain value down to an element.
 */
function unrefElement(value: unknown): Element | undefined {
  if (typeof value === 'function')
    return unrefElement((value as () => unknown)())
  if (value && typeof value === 'object' && 'current' in value)
    return unrefElement((value as { current: unknown }).current)
  return (value as Element | null | undefined) ?? undefined
}

/**
 * Mirrors upstream's `targets` computed: normalize the target into an array
 * of resolved elements, dropping empty slots (upstream filters at observe
 * time with `if (_el)`).
 */
function resolveTargets(target: MaybeComputedElementRefOrArray): Element[] {
  const value = typeof target === 'function' ? (target as () => unknown)() : target
  const items = Array.isArray(value) ? value : [value]

  const elements: Element[] = []
  for (const item of items) {
    const element = unrefElement(item)
    if (element)
      elements.push(element)
  }
  return elements
}

/**
 * Reports changes to the dimensions of an Element's content or the border-box
 *
 * React port of VueUse's `useResizeObserver`.
 *
 * Map from @vueuse/core `useResizeObserver`
 * (`source/vueuse/packages/core/useResizeObserver/`), which wraps a platform
 * `ResizeObserver`, observes every resolved target, and tracks target
 * changes with `watch(computed(() => ...), ..., { immediate: true, flush:
 * 'post' })`.
 *
 * React divergences:
 * - the Vue `watch` over the targets computed becomes an effect that
 *   re-resolves the targets after every render and re-observes only when the
 *   resolved element set or the resolved `window` actually changed — a
 *   re-render that swaps `target.current` re-observes (mirroring the
 *   upstream reactivity) while unchanged renders never do, because every
 *   `observe()` re-delivers the current sizes;
 * - `callback` is read through a ref, so changing it does not re-observe
 *   and the returned `stop` stays referentially stable;
 * - `isSupported` is plain `boolean` state settled in the mount effect
 *   (upstream composes `useSupported`, a `ComputedRef<boolean>`);
 * - `tryOnScopeDispose(stop)` becomes an unmount effect that disconnects;
 * - the observer is constructed through the resolved `window`, and a changed
 *   `window` option re-observes (upstream destructures it once at setup;
 *   this matches this repo's `useOnline`).
 *
 * SSR-safe: nothing touches `window` during render — support detection and
 * observation both happen in effects.
 *
 * @example
 * const el = useRef<HTMLTextAreaElement | null>(null)
 * const [text, setText] = useState('')
 *
 * useResizeObserver(el, (entries) => {
 *   const { width, height } = entries[0].contentRect
 *   setText(`width: ${width}, height: ${height}`)
 * })
 */
export function useResizeObserver(
  target: MaybeComputedElementRefOrArray,
  callback: ResizeObserverCallback,
  options: UseResizeObserverOptions = {},
): UseResizeObserverReturn {
  // Latest-value refs synced each render, so effects always observe with the
  // newest target/callback/options without re-observing on their identity.
  const targetRef = useRef(target)
  const callbackRef = useRef(callback)
  const optionsRef = useRef(options)
  targetRef.current = target
  callbackRef.current = callback
  optionsRef.current = options

  const observerRef = useRef<ResizeObserver | undefined>(undefined)
  const stoppedRef = useRef(false)
  const previousRef = useRef<{ window: Window | undefined, elements: Element[] } | undefined>(undefined)
  const [isSupported, setIsSupported] = useState(false)

  // Re-observe after every render when the resolved targets or window
  // changed (upstream: `watch(targets, ..., { immediate: true })`). Diffing
  // keeps unchanged renders from re-observing, since each observe()
  // re-delivers the observed sizes.
  useEffect(() => {
    if (stoppedRef.current)
      return

    const { window: customWindow, ...observerOptions } = optionsRef.current
    const win = customWindow ?? (typeof window === 'undefined' ? undefined : window)
    const supported = Boolean(win && 'ResizeObserver' in win)
    setIsSupported(supported)

    const elements = resolveTargets(targetRef.current)
    const previous = previousRef.current
    const unchanged = Boolean(
      previous
      && previous.window === win
      && previous.elements.length === elements.length
      && previous.elements.every((element, index) => element === elements[index])
      && observerRef.current,
    )
    previousRef.current = { window: win, elements }

    if (unchanged)
      return

    observerRef.current?.disconnect()
    observerRef.current = undefined

    if (supported && win) {
      // The constructor is reached through the resolved window so a custom
      // `window` option can provide its own; the global `ResizeObserver` var
      // is not a `Window` member in TS's DOM lib, hence the structural cast.
      const winWithObserver = win as unknown as { ResizeObserver: typeof ResizeObserver }
      const observer = new winWithObserver.ResizeObserver((entries, instance) => callbackRef.current(entries, instance))
      observerRef.current = observer
      for (const element of elements)
        observer.observe(element, observerOptions)
    }
  })

  // Disconnect on unmount (upstream: `tryOnScopeDispose(stop)`). Kept as a
  // separate mount-only effect so render-driven re-runs of the effect above
  // never disconnect an observer whose targets are unchanged, and so a
  // StrictMode remount keeps observing.
  useEffect(() => () => {
    observerRef.current?.disconnect()
    observerRef.current = undefined
  }, [])

  const stop = useCallback(() => {
    stoppedRef.current = true
    observerRef.current?.disconnect()
    observerRef.current = undefined
  }, [])

  return { isSupported, stop }
}
