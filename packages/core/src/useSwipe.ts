import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Accepts a plain value, a React-style ref-like object (`{ current }`) or a
 * getter function — the React equivalent of VueUse's `MaybeRefOrGetter`.
 */
export type MaybeRefOrGetter<T> = T | { current: T } | (() => T)

export type UseSwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none'

interface Position {
  x: number
  y: number
}

/**
 * Specify a custom `window` instance, e.g. working with iframes or in
 * testing environments.
 *
 * Local mirror of upstream `ConfigurableWindow`, kept non-exported so the
 * `export *` barrel does not collide with `useOnline`'s export (TS2308).
 * Mirrored for API-shape parity only — like upstream, `useSwipe` never
 * reads it.
 */
interface ConfigurableWindow {
  window?: Window
}

export interface UseSwipeOptions extends ConfigurableWindow {
  /**
   * Register events as passive
   *
   * @default true
   */
  passive?: boolean

  /**
   * @default 50
   */
  threshold?: number

  /**
   * Callback on swipe start
   */
  onSwipeStart?: (e: TouchEvent) => void

  /**
   * Callback on swipe moves
   */
  onSwipe?: (e: TouchEvent) => void

  /**
   * Callback on swipe ends
   */
  onSwipeEnd?: (e: TouchEvent, direction: UseSwipeDirection) => void
}

export interface UseSwipeReturn {
  isSwiping: boolean
  direction: UseSwipeDirection
  coordsStart: Readonly<Position>
  coordsEnd: Readonly<Position>
  lengthX: number
  lengthY: number
  stop: () => void
}

function resolveSwipeTarget(
  target: MaybeRefOrGetter<EventTarget | null | undefined>,
): EventTarget | null | undefined {
  if (typeof target === 'function')
    return target()
  if (target !== null && typeof target === 'object' && 'current' in target)
    return (target as { current: EventTarget | null | undefined }).current
  return target
}

function getSwipeDirection(start: Position, end: Position, threshold: number): UseSwipeDirection {
  const diffX = start.x - end.x
  const diffY = start.y - end.y
  const isThresholdExceeded = Math.max(Math.abs(diffX), Math.abs(diffY)) >= threshold

  if (!isThresholdExceeded)
    return 'none'

  if (Math.abs(diffX) > Math.abs(diffY))
    return diffX > 0 ? 'left' : 'right'

  return diffY > 0 ? 'up' : 'down'
}

/**
 * Reactive swipe detection based on
 * [`TouchEvents`](https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent).
 *
 * Map from @vueuse/core `useSwipe`
 * React port of VueUse's `useSwipe` (`source/vueuse/packages/core/useSwipe/`),
 * which tracks `touchstart` / `touchmove` / `touchend` + `touchcancel` on the
 * target and derives the swipe `direction` once `max(|dx|, |dy|)` crosses
 * `threshold` (default `50`), comparing the axes: `|dx| > |dy|` decides
 * `left`/`right`, otherwise `up`/`down`. Below the threshold the direction
 * stays `'none'` and `isSwiping` stays `false` — `onSwipeEnd` only fires for
 * touches that actually crossed the threshold (like upstream).
 *
 * React divergences:
 *
 * - the Vue return object (`isSwiping` ref, `direction` / `lengthX` /
 *   `lengthY` computeds, reactive coords) becomes plain values backed by
 *   state, derived during render — the touch listeners live in a
 *   self-contained `useEffect` (upstream composes `useEventListener`) and are
 *   removed on unmount;
 * - `target` accepts an element, a ref-like `{ current }` object or a getter
 *   (React equivalent of `MaybeRefOrGetter`). It is re-resolved on every
 *   render and the listeners re-bind when the resolved element changes;
 *   ref-likes are re-read at bind time, so a `useRef` target that is `null`
 *   during first render still binds once React attaches the element;
 * - `onSwipeStart` / `onSwipe` / `onSwipeEnd` are read through latest-value
 *   refs, so the listeners always call the newest callbacks without
 *   re-binding on renders;
 * - `stop()` permanently detaches the listeners for this hook instance
 *   (upstream stops the `useEventListener` watcher too); a fresh mount
 *   starts listening again;
 * - SSR-safe: nothing touches `window` or the DOM during render — listeners
 *   attach in the mount effect only.
 *
 * @param target - element, ref-like `{ current }` object or getter returning
 *   the event target to listen on
 * @param options - `passive` (default `true`), `threshold` (default `50`) and
 *   the `onSwipeStart` / `onSwipe` / `onSwipeEnd` callbacks
 *
 * @example
 * const el = useRef<HTMLDivElement>(null)
 * const { isSwiping, direction, lengthX, lengthY } = useSwipe(el, {
 *   threshold: 50,
 *   onSwipeEnd: (e, direction) => console.log(direction),
 * })
 */
export function useSwipe(
  target: MaybeRefOrGetter<EventTarget | null | undefined>,
  options: UseSwipeOptions = {},
): UseSwipeReturn {
  const { threshold = 50, passive = true } = options

  // latest-value refs synced each render so the listeners registered in the
  // mount effect always read the newest options (stable handler identities)
  const targetRef = useRef(target)
  const optionsRef = useRef(options)
  targetRef.current = target
  optionsRef.current = options

  // coords + isSwiping live in refs for the synchronous event-time math (the
  // preventDefault decision and the direction passed to onSwipeEnd) and in
  // state for rendering
  const [coords, setCoords] = useState<{ start: Position, end: Position }>({
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  })
  const coordsRef = useRef(coords)
  const [isSwiping, setIsSwiping] = useState(false)
  const isSwipingRef = useRef(false)
  const stoppedRef = useRef(false)
  const detachRef = useRef<(() => void) | null>(null)

  // dependency-tracking read: refs populate before effects run, so the first
  // render reports `null` for ref-like targets — the effect below re-resolves
  // fresh and re-binds whenever the resolved element changes
  const trackedTarget = resolveSwipeTarget(target)

  const stop = useCallback(() => {
    stoppedRef.current = true
    detachRef.current?.()
    detachRef.current = null
  }, [])

  useEffect(() => {
    if (stoppedRef.current)
      return

    const el = resolveSwipeTarget(targetRef.current)
    if (!el)
      return

    const listenerOptions = { passive, capture: !passive }

    const getTouchEventCoords = (e: TouchEvent): [number, number] =>
      [e.touches[0].clientX, e.touches[0].clientY]

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1)
        return
      const [x, y] = getTouchEventCoords(e)
      coordsRef.current = { start: { x, y }, end: { x, y } }
      setCoords(coordsRef.current)
      optionsRef.current.onSwipeStart?.(e)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1)
        return
      const [x, y] = getTouchEventCoords(e)
      const { start } = coordsRef.current
      coordsRef.current = { start, end: { x, y } }
      setCoords(coordsRef.current)

      const { onSwipe, threshold: moveThreshold = 50 } = optionsRef.current
      const diffX = start.x - x
      const diffY = start.y - y

      if (listenerOptions.capture && !listenerOptions.passive && Math.abs(diffX) > Math.abs(diffY))
        e.preventDefault()

      const isThresholdExceeded = Math.max(Math.abs(diffX), Math.abs(diffY)) >= moveThreshold
      if (!isSwipingRef.current && isThresholdExceeded) {
        isSwipingRef.current = true
        setIsSwiping(true)
      }
      if (isSwipingRef.current)
        onSwipe?.(e)
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (isSwipingRef.current) {
        const { start, end } = coordsRef.current
        const { onSwipeEnd, threshold: endThreshold = 50 } = optionsRef.current
        onSwipeEnd?.(e, getSwipeDirection(start, end, endThreshold))
      }

      isSwipingRef.current = false
      setIsSwiping(false)
    }

    el.addEventListener('touchstart', onTouchStart as EventListener, listenerOptions)
    el.addEventListener('touchmove', onTouchMove as EventListener, listenerOptions)
    el.addEventListener('touchend', onTouchEnd as EventListener, listenerOptions)
    el.addEventListener('touchcancel', onTouchEnd as EventListener, listenerOptions)

    const detach = () => {
      el.removeEventListener('touchstart', onTouchStart as EventListener, listenerOptions)
      el.removeEventListener('touchmove', onTouchMove as EventListener, listenerOptions)
      el.removeEventListener('touchend', onTouchEnd as EventListener, listenerOptions)
      el.removeEventListener('touchcancel', onTouchEnd as EventListener, listenerOptions)
      detachRef.current = null
    }
    detachRef.current = detach

    return detach
  }, [trackedTarget, passive])

  const { start, end } = coords

  return {
    isSwiping,
    direction: getSwipeDirection(start, end, threshold),
    coordsStart: start,
    coordsEnd: end,
    lengthX: start.x - end.x,
    lengthY: start.y - end.y,
    stop,
  }
}
