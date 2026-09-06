import type { ConfigurableWindow, MaybeRefOrGetter } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Element types accepted as observation targets. Upstream's `MaybeElement`
 * also includes Vue component instances (`VueInstance`) — React refs hold
 * DOM nodes directly, so there is no equivalent here.
 *
 * @note not re-exported: `useResizeObserver` already exports the same names
 * (`MaybeElement`, `MaybeComputedElementRef`, `MaybeComputedElementRefOrArray`)
 * from `@reaxuse/core`, so `export *` from both modules would collide.
 */
type MaybeElement = HTMLElement | SVGElement | undefined | null

/**
 * A plain element, a React ref object (`{ current }`), or a getter returning
 * one — the React equivalent of Vue's `MaybeRefOrGetter<T>`.
 */
type MaybeComputedElementRef<T extends MaybeElement = MaybeElement>
  = | T
    | { readonly current: T }
    | (() => T)

/**
 * A single target, an array of targets, a ref-like holding an array, or a
 * getter returning an array (or `null`) — mirrors upstream's
 * `MaybeComputedElementRefOrArray`.
 */
type MaybeComputedElementRefOrArray<T extends MaybeElement = MaybeElement>
  = | MaybeComputedElementRef<T>
    | MaybeComputedElementRef<T>[]
    | MaybeRefOrGetter<T[] | null>

/**
 * Options for `useMutationObserver`: passthrough of the platform
 * `MutationObserverInit` (e.g. `attributes`, `childList`, `subtree`) plus a
 * custom `window` instance, e.g. working with iframes or in testing
 * environments.
 */
export interface UseMutationObserverOptions extends MutationObserverInit, ConfigurableWindow {}

/**
 * Return of `useMutationObserver`. Upstream extends `Supportable` with a
 * `ComputedRef<boolean>`; the React port exposes a plain `boolean` state.
 */
export interface UseMutationObserverReturn {
  /**
   * Whether the current environment supports the `MutationObserver` API.
   * Starts `false` and settles in a mount effect (SSR-safe).
   */
  isSupported: boolean
  /**
   * Stop observing. Disconnects the observer and stops tracking target
   * changes. Calling it again is a no-op — the hook does not restart after
   * `stop()`.
   */
  stop: () => void
  /**
   * Return all pending mutations records that have not yet been delivered to
   * the callback, then clear them. Returns `undefined` when no observer is
   * active (e.g. after `stop()`).
   */
  takeRecords: () => MutationRecord[] | undefined
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
  const value = toValue(target as MaybeRefOrGetter<unknown>)
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
 * Watch for changes being made to the DOM tree
 *
 * React port of VueUse's `useMutationObserver`.
 *
 * Map from @vueuse/core `useMutationObserver`
 * (`source/vueuse/packages/core/useMutationObserver/`), which wraps a
 * platform `MutationObserver`, observes every resolved target, and tracks
 * target changes with `watch(computed(() => ...), ..., { immediate: true,
 * flush: 'post' })`.
 *
 * React divergences:
 * - the Vue `watch` over the targets computed becomes an effect that
 *   re-resolves the targets after every render and re-observes only when the
 *   resolved element set or the resolved `window` actually changed — a
 *   re-render that swaps `target.current` re-observes (mirroring the
 *   upstream reactivity) while unchanged renders never do, so pending
 *   mutation records are never dropped on an unnecessary reconnect;
 * - `callback` is read through a ref, so changing it does not re-observe and
 *   the returned `stop` stays referentially stable;
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
 * @see https://vueuse.org/core/useMutationObserver/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 * @example
 * const el = useRef<HTMLDivElement | null>(null)
 * const [attributes, setAttributes] = useState<string[]>([])
 *
 * useMutationObserver(el, (mutations) => {
 *   if (mutations[0])
 *     setAttributes(prev => [...prev, mutations[0].attributeName!])
 * }, { attributes: true })
 */
export function useMutationObserver(
  target: MaybeComputedElementRefOrArray,
  callback: MutationCallback,
  options: UseMutationObserverOptions = {},
): UseMutationObserverReturn {
  // Latest-value refs synced each render, so effects always observe with the
  // newest target/callback/options without re-observing on their identity.
  const targetRef = useRef(target)
  const callbackRef = useRef(callback)
  const optionsRef = useRef(options)
  targetRef.current = target
  callbackRef.current = callback
  optionsRef.current = options

  const observerRef = useRef<MutationObserver | undefined>(undefined)
  const stoppedRef = useRef(false)
  const previousRef = useRef<{ window: Window | undefined, elements: Element[] } | undefined>(undefined)
  const [isSupported, setIsSupported] = useState(false)

  // Re-observe after every render when the resolved targets or window
  // changed (upstream: `watch(targets, ..., { immediate: true })`). Diffing
  // keeps unchanged renders from re-observing, so a disconnect never drops
  // mutation records that are still queued for delivery.
  useEffect(() => {
    if (stoppedRef.current)
      return

    const { window: customWindow, ...mutationOptions } = optionsRef.current
    const win = customWindow ?? (typeof window === 'undefined' ? undefined : window)
    const supported = Boolean(win && 'MutationObserver' in win)
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
      // `window` option can provide its own; the global `MutationObserver`
      // var is not a `Window` member in TS's DOM lib, hence the structural
      // cast.
      const winWithObserver = win as unknown as { MutationObserver: typeof MutationObserver }
      const observer = new winWithObserver.MutationObserver((mutations, instance) => callbackRef.current(mutations, instance))
      observerRef.current = observer
      for (const element of elements)
        observer.observe(element, mutationOptions)
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

  const takeRecords = useCallback(() => {
    return observerRef.current?.takeRecords()
  }, [])

  return { isSupported, stop, takeRecords }
}
