import type { MaybeRefOrGetter } from '@reaxuse/shared'
import { useCallback, useEffect, useRef } from 'react'
import { useEventListener } from './useEventListener'

const DEFAULT_THRESHOLD = 500
const DEFAULT_DISTANCE_THRESHOLD = 10

export interface UseLongPressModifiers {
  /**
   * Require the `ctrl` key to match the pointer event.
   *
   * @default undefined
   */
  ctrl?: boolean
  /**
   * Require the `shift` key to match the pointer event.
   *
   * @default undefined
   */
  shift?: boolean
  /**
   * Require the `alt` key to match the pointer event.
   *
   * @default undefined
   */
  alt?: boolean
  /**
   * Require the `meta` key to match the pointer event.
   *
   * @default undefined
   */
  meta?: boolean
}

export interface UseLongPressOptions {
  /**
   * Time in ms till `longpress` gets called
   *
   * @default 500
   */
  threshold?: number

  /**
   * Keyboard modifiers that must match the pointer event for the long press
   * to be detected. Only the listed keys are checked — `true` requires the
   * key to be held down, `false` requires it to be released.
   */
  modifiers?: UseLongPressModifiers

  /**
   * Allowance of moving distance in pixels,
   * the action will get canceled when moving too far from the pointerdown position.
   *
   * @default 10
   */
  distanceThreshold?: number | false

  /**
   * Function called when the press starts, right after `pointerdown` is received.
   *
   * @param pointerEvent the native {@link PointerEvent} triggered by the browser
   */
  onStart?: (pointerEvent: PointerEvent) => void

  /**
   * Function called when the pointer is released after the long press has fired.
   *
   * @param pointerEvent the native {@link PointerEvent} triggered by the browser
   */
  onFinish?: (pointerEvent: PointerEvent) => void

  /**
   * Function called when the press is released (or canceled by the user agent
   * via `pointercancel`) before the long press has fired, or when the pointer
   * moves beyond `distanceThreshold` while the press is pending.
   *
   * @param pointerEvent the native {@link PointerEvent} triggered by the browser
   */
  onCancel?: (pointerEvent: PointerEvent) => void
}

function matchesModifiers(evt: PointerEvent, modifiers?: UseLongPressModifiers): boolean {
  if (!modifiers)
    return true

  return (modifiers.ctrl === undefined || evt.ctrlKey === modifiers.ctrl)
    && (modifiers.shift === undefined || evt.shiftKey === modifiers.shift)
    && (modifiers.alt === undefined || evt.altKey === modifiers.alt)
    && (modifiers.meta === undefined || evt.metaKey === modifiers.meta)
}

/**
 * Listen for a long press on an element.
 *
 * Map from @vueuse/core `onLongPress`
 * (`source/vueuse/packages/core/onLongPress/`). A long press is detected via
 * `pointerdown` / `pointerup` (and `pointerleave` / `pointercancel`) /
 * `pointermove` events: after `pointerdown` the handler fires once the
 * `threshold` has elapsed while the pointer stays pressed, and the press is
 * canceled when the pointer is released early or moves beyond
 * `distanceThreshold` pixels (set to `false` to disable movement detection).
 *
 * React divergences:
 * - React has no composable-function API, so this is a hook (upstream's
 *   `onLongPress` is a plain function): the listeners are registered in a
 *   mount effect and removed on unmount;
 * - all callbacks and options are read through latest-value refs, so new
 *   inline handler identities or changing options never re-subscribe the
 *   listeners — only a resolved target / event-set change re-binds them;
 * - upstream's `delay` option is renamed `threshold`, upstream's single
 *   `onMouseUp` release callback is split into `onFinish` (released after the
 *   long press has fired) and `onCancel` (released or user-agent-canceled
 *   before it fired, or moved and thereby canceled), and `modifiers` filter on
 *   keyboard modifier keys (`ctrl` / `shift` / `alt` / `meta`) instead of
 *   upstream's event-manipulation flags (`prevent` / `stop` / `self` /
 *   `once` / `capture`);
 * - the returned value is a stop function (`() => void`) that clears any
 *   pending long-press timer and removes the currently registered listeners
 *   (upstream returns a Vue `Fn` that stops its internal watcher);
 * - SSR-safe: nothing touches `window` during render — binding happens in the
 *   mount effect only.
 *
 * @see https://vueuse.org/core/onLongPress/
 *
 * @example
 * const target = useRef<HTMLButtonElement | null>(null)
 * const [longPressed, setLongPressed] = useState(false)
 *
 * useLongPress(target, () => {
 *   setLongPressed(true)
 * })
 *
 * const stop = useLongPress(target, handler, { threshold: 1000 })
 * stop()
 */
export function useLongPress(
  target: MaybeRefOrGetter<EventTarget | null | undefined>,
  handler: (evt: PointerEvent) => void,
  options: UseLongPressOptions = {},
): () => void {
  const { threshold = DEFAULT_THRESHOLD, distanceThreshold = DEFAULT_DISTANCE_THRESHOLD, modifiers, onStart, onFinish, onCancel } = options

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const posStart = useRef<{ x: number, y: number } | null>(null)
  const startTimestamp = useRef<number | null>(null)
  const hasLongPressed = useRef(false)

  // latest-value ref so listeners bound once still read the newest callbacks
  // and options without re-subscribing on every render
  const latest = useRef({ handler, threshold, distanceThreshold, modifiers, onStart, onFinish, onCancel })
  latest.current = { handler, threshold, distanceThreshold, modifiers, onStart, onFinish, onCancel }

  const clear = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current)
      timeout.current = null
    }
    posStart.current = null
    startTimestamp.current = null
    hasLongPressed.current = false
  }, [])

  function onDown(evt: PointerEvent) {
    const { threshold: pressThreshold, modifiers: pressModifiers, onStart: pressStart, handler: pressHandler } = latest.current
    if (!matchesModifiers(evt, pressModifiers))
      return

    clear()

    posStart.current = { x: evt.x, y: evt.y }
    startTimestamp.current = evt.timeStamp
    pressStart?.(evt)

    const timer = setTimeout(() => {
      timeout.current = null
      hasLongPressed.current = true
      pressHandler(evt)
    }, pressThreshold)
    timeout.current = timer
  }

  function onMove(evt: PointerEvent) {
    const { distanceThreshold: moveThreshold, onCancel: moveCancel } = latest.current
    if (!posStart.current || moveThreshold === false)
      return

    const dx = evt.x - posStart.current.x
    const dy = evt.y - posStart.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance >= moveThreshold) {
      moveCancel?.(evt)
      clear()
    }
  }

  function onRelease(evt: PointerEvent) {
    const { onFinish: releaseFinish, onCancel: releaseCancel } = latest.current
    const [releasePosStart, releaseStartTimestamp, releaseHasLongPressed] = [
      posStart.current,
      startTimestamp.current,
      hasLongPressed.current,
    ]
    clear()

    if (!releasePosStart || !releaseStartTimestamp)
      return

    if (releaseHasLongPressed)
      releaseFinish?.(evt)
    else
      releaseCancel?.(evt)
  }

  const stopPointerDown = useEventListener(target, 'pointerdown', onDown)
  const stopPointerMove = useEventListener(target, 'pointermove', onMove)
  const stopPointerRelease = useEventListener(target, ['pointerup', 'pointerleave', 'pointercancel'], onRelease)

  // clear any in-flight long-press timer on unmount
  useEffect(() => () => clear(), [clear])

  const stop = useCallback(() => {
    clear()
    stopPointerDown?.()
    stopPointerMove?.()
    stopPointerRelease?.()
  }, [clear, stopPointerDown, stopPointerMove, stopPointerRelease])

  return stop
}
