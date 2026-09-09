import type { ConfigurableWindow, RefOrValue } from '@reaxuse/shared'
import type { ElementTarget } from '../useResizeObserver'
import { toValue } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useIntersectionObserver } from '../useIntersectionObserver'

/**
 * Options for `useElementVisibility`. Mirrors upstream's
 * `UseElementVisibilityOptions` minus `controls` — the React port returns a
 * plain `boolean`, so there is no control object to expose.
 */
export interface UseElementVisibilityOptions extends ConfigurableWindow {
  /**
   * Initial value.
   *
   * @default false
   */
  initialValue?: boolean
  /**
   * The element that is used as the viewport for checking visibility of the target.
   */
  scrollTarget?: ElementTarget | Document
  /**
   * Either a single number or an array of numbers between 0.0 and 1.
   *
   * @default 0
   */
  threshold?: number | number[]
  /**
   * A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections.
   */
  rootMargin?: RefOrValue<string>
  /**
   * Stop tracking when element visibility changes for the first time.
   *
   * @default false
   */
  once?: boolean
}

/**
 * React equivalent of upstream's `unrefElement`: resolves a ref-like object
 * or a plain value down to an element (or, for a scroll target, a
 * `Document`). Built on the shared `toValue`.
 */
function resolveTarget(value: unknown): Element | Document | undefined {
  const resolved = toValue(value as RefOrValue<unknown>)
  if (resolved && typeof resolved === 'object' && 'current' in resolved)
    return resolveTarget(resolved)
  return (resolved as Element | Document | null | undefined) ?? undefined
}

/**
 * Parse an `IntersectionObserver`-style `rootMargin` string (`'10px 20px 30px
 * 40px'`, CSS margin shorthand) into per-side pixel offsets. Values with units
 * other than `px` are ignored — the fallback approximates the root expansion.
 */
function parseRootMargin(rootMargin: string | undefined): { top: number, right: number, bottom: number, left: number } {
  if (!rootMargin)
    return { top: 0, right: 0, bottom: 0, left: 0 }
  const parts = rootMargin.trim().split(/\s+/).map((part) => {
    const match = /^(-?\d+(?:\.\d+)?)px$/i.exec(part)
    return match ? Number.parseFloat(match[1]) : 0
  })
  const [top = 0, right = top, bottom = top, left = right] = parts
  return { top, right, bottom, left }
}

/**
 * Fallback intersection check used when `IntersectionObserver` is unavailable:
 * expands the viewport (or `scrollTarget`) bounding box by `rootMargin` and
 * returns whether the visible portion of the element meets `threshold`.
 */
function computeVisibility(
  element: Element,
  root: Element | Document | undefined,
  resolvedWindow: Window,
  rootMargin: string | undefined,
  threshold: number | number[],
): boolean {
  const elRect = element.getBoundingClientRect()

  let rootRect: DOMRect
  if (root && root instanceof Element) {
    rootRect = root.getBoundingClientRect()
  }
  else {
    rootRect = {
      top: 0,
      left: 0,
      right: resolvedWindow.innerWidth,
      bottom: resolvedWindow.innerHeight,
      width: resolvedWindow.innerWidth,
      height: resolvedWindow.innerHeight,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect
  }

  const { top, right, bottom, left } = parseRootMargin(rootMargin)
  const rootLeft = rootRect.left - left
  const rootTop = rootRect.top - top
  const rootRight = rootRect.right + right
  const rootBottom = rootRect.bottom + bottom

  const intersectionWidth = Math.max(0, Math.min(rootRight, elRect.right) - Math.max(rootLeft, elRect.left))
  const intersectionHeight = Math.max(0, Math.min(rootBottom, elRect.bottom) - Math.max(rootTop, elRect.top))

  const elementArea = Math.max(elRect.width * elRect.height, 0)
  const ratio = elementArea > 0 ? (intersectionWidth * intersectionHeight) / elementArea : 0

  if (ratio <= 0)
    return false
  if (typeof threshold === 'number')
    return threshold <= 0 || ratio >= threshold
  return Math.min(...threshold) <= 0 || ratio >= Math.min(...threshold)
}

/**
 * Tracks the visibility of an element within the viewport.
 *
 * Map from @vueuse/core `useElementVisibility`
 * (`source/vueuse/packages/core/useElementVisibility/`), which observes the
 * target with an `IntersectionObserver` rooted at the viewport (or a custom
 * `scrollTarget`) and maps the latest entry's `isIntersecting` onto a reactive
 * boolean.
 *
 * React divergences:
 * - upstream returns a `ShallowRef<boolean>`, or — with `controls: true` —
 *   that ref bundled with the underlying observer controls; the React port
 *   returns a plain `boolean` state and drops the `controls` variant together
 *   with the Pausable members (`isActive`/`pause`/`resume`), consistent with
 *   this repo's `useIntersectionObserver` React contract;
 * - the observation re-uses `useIntersectionObserver`, so target/root/root
 *   margin re-resolution and observer teardown follow that hook; the callback
 *   picks the latest `isIntersecting` across the delivered entries by `time`
 *   (upstream loop preserved 1:1);
 * - when `IntersectionObserver` is unavailable (SSR, older browsers) the hook
 *   falls back to `scroll`/`resize` listeners that recompute the intersection
 *   of the target and viewport (or `scrollTarget`) bounding boxes, honoring
 *   `rootMargin` and `threshold`; the fallback activates from
 *   `useIntersectionObserver`'s `isSupported` state;
 * - `once` stops tracking after the first visibility change by calling the
 *   active `stop` (observer disconnect or listener removal);
 * - SSR-safe: the resolved `window` is read through `typeof` guards and the
 *   fallback listeners attach only in effects, so nothing touches `window`
 *   during render.
 *
 * @example
 * const target = useRef<HTMLDivElement | null>(null)
 * const targetIsVisible = useElementVisibility(target)
 *
 * return <div ref={target}>{targetIsVisible ? 'inside' : 'outside'}</div>
 */
export function useElementVisibility(
  element: ElementTarget,
  options: UseElementVisibilityOptions = {},
): boolean {
  const {
    window: windowOption,
    scrollTarget,
    threshold = 0,
    rootMargin,
    once = false,
    initialValue = false,
  } = options

  const [isVisible, setIsVisible] = useState(initialValue)

  // Latest-value refs synced each render, so effects and the observer callback
  // always read fresh values without re-running on identity changes.
  const isVisibleRef = useRef(isVisible)
  isVisibleRef.current = isVisible

  const onceRef = useRef(once)
  onceRef.current = once

  // Active stop — the observer `stop` on the `IntersectionObserver` path, the
  // listener-removal cleanup on the scroll/resize fallback path. Called by
  // `updateVisibility` when `once` fires and torn down on unmount.
  const stopRef = useRef<(() => void) | undefined>(undefined)

  const updateVisibility = useCallback((visible: boolean) => {
    if (visible === isVisibleRef.current)
      return
    isVisibleRef.current = visible
    setIsVisible(visible)
    if (onceRef.current)
      stopRef.current?.()
  }, [])

  const onIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    // Get the latest value of isIntersecting based on the entry time
    let isIntersecting = isVisibleRef.current
    let latestTime = 0
    for (const entry of entries) {
      if (entry.time >= latestTime) {
        latestTime = entry.time
        isIntersecting = entry.isIntersecting
      }
    }
    updateVisibility(isIntersecting)
  }, [updateVisibility])

  // SSR-safe window resolution: an explicit `window` option wins, otherwise the
  // global is used; `window: null` disables observation entirely.
  const win: Window | undefined = windowOption === undefined
    ? (typeof window === 'undefined' ? undefined : window)
    : (windowOption ?? undefined)

  const { isSupported, stop } = useIntersectionObserver(
    element,
    onIntersect,
    {
      window: win,
      root: scrollTarget,
      rootMargin,
      threshold,
    },
  )

  // Fallback listener cleanup, kept separate from `stopRef` so transitions
  // never accidentally call the observer's terminal `stop`.
  const fallbackCleanupRef = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    if (isSupported) {
      // `IntersectionObserver` path — drop any fallback listeners still active
      // from the mount render (before `isSupported` settled).
      fallbackCleanupRef.current?.()
      fallbackCleanupRef.current = undefined
      stopRef.current = stop
      return
    }

    const resolvedWindow = win
    if (!resolvedWindow
      || typeof resolvedWindow.addEventListener !== 'function'
      || typeof resolvedWindow.removeEventListener !== 'function') {
      fallbackCleanupRef.current?.()
      fallbackCleanupRef.current = undefined
      stopRef.current = undefined
      return
    }

    const el = resolveTarget(element)
    if (!el || !(el instanceof Element)) {
      fallbackCleanupRef.current?.()
      fallbackCleanupRef.current = undefined
      stopRef.current = undefined
      return
    }

    const root = scrollTarget === undefined ? undefined : resolveTarget(scrollTarget)
    if (root && !(root instanceof Element) && !(root instanceof Document)) {
      fallbackCleanupRef.current?.()
      fallbackCleanupRef.current = undefined
      stopRef.current = undefined
      return
    }

    const rootMarginValue = rootMargin === undefined ? undefined : toValue(rootMargin)

    const check = () => {
      updateVisibility(computeVisibility(el, root, resolvedWindow, rootMarginValue, threshold))
    }

    const scrollElement: EventTarget = root instanceof Element || root instanceof Document ? root : resolvedWindow
    const cleanup = () => {
      resolvedWindow.removeEventListener('resize', check)
      scrollElement.removeEventListener('scroll', check)
    }

    fallbackCleanupRef.current?.()
    fallbackCleanupRef.current = cleanup
    stopRef.current = cleanup

    check()
    resolvedWindow.addEventListener('resize', check)
    scrollElement.addEventListener('scroll', check, { passive: true })
  }, [isSupported, stop, element, scrollTarget, rootMargin, threshold, win, updateVisibility])

  // Teardown the active stop on unmount (the observer itself is disconnected
  // by `useIntersectionObserver`'s own unmount effect).
  useEffect(() => () => {
    fallbackCleanupRef.current?.()
    fallbackCleanupRef.current = undefined
    stopRef.current = undefined
  }, [])

  return isVisible
}
