import type { ConfigurableWindow, MaybeRefOrGetter } from '@reaxuse/shared'
import type { MaybeComputedElementRef, MaybeComputedElementRefOrArray } from './useResizeObserver'
import { toArray, toValue } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Options for `useIntersectionObserver`: the platform `IntersectionObserver`
 * options (`root`/`rootMargin`/`threshold`) plus `immediate` and a custom
 * `window` instance, e.g. working with iframes or in testing environments.
 * The accepted target types (`MaybeElement`/`MaybeComputedElementRef`/
 * `MaybeComputedElementRefOrArray`) are shared with `useResizeObserver`.
 */
export interface UseIntersectionObserverOptions extends ConfigurableWindow {
  /**
   * Start the IntersectionObserver immediately on creation.
   *
   * @default true
   */
  immediate?: boolean

  /**
   * The Element or Document whose bounds are used as the bounding box when testing for intersection.
   */
  root?: MaybeComputedElementRef | Document

  /**
   * A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections.
   */
  rootMargin?: MaybeRefOrGetter<string>

  /**
   * Either a single number or an array of numbers between 0.0 and 1.
   * @default 0
   */
  threshold?: number | number[]
}

/**
 * Return of `useIntersectionObserver`. Upstream additionally exposes the
 * Pausable members (`isActive`/`pause`/`resume`); the React port keeps the
 * observer contract of this repo (`useResizeObserver` style):
 * `{ isSupported, stop }`.
 */
export interface UseIntersectionObserverReturn {
  /**
   * Whether the current environment supports the `IntersectionObserver` API.
   * Starts `false` and settles in a mount effect (SSR-safe).
   */
  isSupported: boolean
  /**
   * Disconnect the observer and stop observing. Calling it again is a no-op —
   * the hook does not restart after `stop()`.
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
 * Mirrors upstream's `targets` computed: `toValue` first (so ref-likes and
 * getters resolve, including ref-likes holding an array of elements), then
 * `toArray`, then resolve every item down to an element, dropping empty
 * slots (upstream filters with `notNullish`).
 */
function resolveTargets(target: MaybeComputedElementRefOrArray): Element[] {
  const value = toValue(target as MaybeRefOrGetter<unknown>)
  const items = toArray(value)

  const elements: Element[] = []
  for (const item of items) {
    const element = unrefElement(item)
    if (element)
      elements.push(element)
  }
  return elements
}

/**
 * Detects changes to a target element's visibility.
 *
 * Map from @vueuse/core `useIntersectionObserver`
 * (`source/vueuse/packages/core/useIntersectionObserver/`), which observes
 * every resolved target with a platform `IntersectionObserver` and rebuilds
 * the observer through `watch(...)` whenever the resolved targets, root, root
 * margin or active state change.
 *
 * React divergences:
 * - the Vue `watch` over the targets/root/rootMargin computeds becomes an
 *   effect that re-resolves them after every render and re-observes only when
 *   something actually changed — a re-render that swaps `target.current`
 *   re-observes (mirroring the upstream reactivity), while unchanged renders
 *   never recreate the observer;
 * - `callback` is read through a ref, so changing it does not re-observe and
 *   the returned `stop` stays referentially stable;
 * - `isSupported` is plain `boolean` state settled in the mount effect
 *   (upstream composes `useSupported`, a `ComputedRef<boolean>`);
 * - `tryOnScopeDispose(stop)` becomes an unmount effect that disconnects;
 * - the Pausable members (`isActive`/`pause`/`resume`) are dropped — the
 *   React contract mirrors `useResizeObserver`: `{ isSupported, stop }`, so
 *   `immediate: false` keeps the observer idle for the whole lifetime;
 * - the observer is constructed through the resolved `window`, and a changed
 *   `window` option re-observes (upstream destructures it once at setup;
 *   this matches this repo's `useResizeObserver`).
 *
 * SSR-safe: nothing touches `window` during render — support detection and
 * observation both happen in effects.
 *
 * @example
 * const target = useRef<HTMLDivElement | null>(null)
 * const [targetIsVisible, setIsVisible] = useState(false)
 *
 * useIntersectionObserver(target, ([entry]) => {
 *   setIsVisible(entry?.isIntersecting || false)
 * })
 */
export function useIntersectionObserver(
  target: MaybeComputedElementRefOrArray,
  callback: IntersectionObserverCallback,
  options: UseIntersectionObserverOptions = {},
): UseIntersectionObserverReturn {
  // Latest-value refs synced each render, so effects always observe with the
  // newest target/callback/options without re-observing on their identity.
  const targetRef = useRef(target)
  const callbackRef = useRef(callback)
  const optionsRef = useRef(options)
  targetRef.current = target
  callbackRef.current = callback
  optionsRef.current = options

  const observerRef = useRef<IntersectionObserver | undefined>(undefined)
  const stoppedRef = useRef(false)
  const previousRef = useRef<{
    window: Window | undefined
    elements: Element[]
    root: Element | Document | undefined
    rootMargin: string | undefined
  } | undefined>(undefined)
  const [isSupported, setIsSupported] = useState(false)

  // Re-observe after every render when the resolved targets, root, root
  // margin or window changed (upstream: `watch(..., { immediate: true })`).
  // Diffing keeps unchanged renders from recreating the observer.
  useEffect(() => {
    if (stoppedRef.current)
      return

    const {
      window: customWindow,
      immediate = true,
      root: rootOption,
      rootMargin: rootMarginOption,
      threshold = 0,
    } = optionsRef.current
    const win = customWindow ?? (typeof window === 'undefined' ? undefined : window)
    const supported = Boolean(win && 'IntersectionObserver' in win)
    setIsSupported(supported)

    if (!immediate)
      return

    const elements = resolveTargets(targetRef.current)
    const root = rootOption === undefined ? undefined : unrefElement(rootOption)
    const rootMargin = rootMarginOption === undefined ? undefined : toValue(rootMarginOption)
    const previous = previousRef.current
    const unchanged = Boolean(
      previous
      && previous.window === win
      && previous.elements.length === elements.length
      && previous.elements.every((element, index) => element === elements[index])
      && previous.root === root
      && previous.rootMargin === rootMargin
      && observerRef.current,
    )
    previousRef.current = { window: win, elements, root, rootMargin }

    if (unchanged)
      return

    observerRef.current?.disconnect()
    observerRef.current = undefined

    if (supported && win) {
      // The constructor is reached through the resolved window so a custom
      // `window` option can provide its own; the global `IntersectionObserver`
      // var is not a `Window` member in TS's DOM lib, hence the structural
      // cast.
      const winWithObserver = win as unknown as { IntersectionObserver: typeof IntersectionObserver }
      const observer = new winWithObserver.IntersectionObserver(
        (entries, instance) => callbackRef.current(entries, instance),
        {
          root: root ?? null,
          rootMargin,
          threshold,
        },
      )
      observerRef.current = observer
      for (const element of elements)
        observer.observe(element)
    }
  })

  // Disconnect on unmount (upstream: `tryOnScopeDispose(stop)`). Kept as a
  // separate mount-only effect so render-driven re-runs of the effect above
  // never disconnect an observer whose inputs are unchanged.
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
