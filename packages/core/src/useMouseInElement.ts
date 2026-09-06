import type { ConfigurableWindow, MaybeRefOrGetter } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'

export type UseMouseCoordType = 'page' | 'client' | 'screen' | 'movement'
export type UseMouseSourceType = 'mouse' | 'touch' | null

export interface MouseInElementOptions extends ConfigurableWindow {
  /**
   * Whether to handle mouse events when the cursor is outside the target element.
   * When enabled, mouse position will continue to be tracked even when outside the element bounds.
   *
   * @default true
   */
  handleOutside?: boolean

  /**
   * Listen to window resize event
   *
   * @default true
   */
  windowScroll?: boolean

  /**
   * Listen to window scroll event
   *
   * @default true
   */
  windowResize?: boolean

  /**
   * Mouse position based by page, client, screen, or relative to previous position
   *
   * @default 'page'
   */
  type?: UseMouseCoordType

  /**
   * Listen to `touchmove` events
   *
   * @default true
   */
  touch?: boolean

  /**
   * Listen to `scroll` events on window, only effective on type `page`
   *
   * @default true
   */
  scroll?: boolean

  /**
   * Reset to initial value when `touchend` event fired
   *
   * @default false
   */
  resetOnTouchEnds?: boolean

  /**
   * Initial values
   */
  initialValue?: Position
}

interface Position {
  x: number
  y: number
}

export interface UseMouseInElementReturn {
  x: number
  y: number
  sourceType: UseMouseSourceType
  elementX: number
  elementY: number
  elementPositionX: number
  elementPositionY: number
  elementHeight: number
  elementWidth: number
  isOutside: boolean
  stop: () => void
}

type UseMouseInElementState = Omit<UseMouseInElementReturn, 'stop'>

interface NormalizedOptions {
  handleOutside: boolean
  windowScroll: boolean
  windowResize: boolean
  type: UseMouseCoordType
  touch: boolean
  scroll: boolean
  resetOnTouchEnds: boolean
  initialValue: Position
  window: Window | undefined
}

function normalizeOptions(options: MouseInElementOptions): NormalizedOptions {
  return {
    handleOutside: options.handleOutside ?? true,
    windowScroll: options.windowScroll ?? true,
    windowResize: options.windowResize ?? true,
    type: options.type ?? 'page',
    touch: options.touch ?? true,
    scroll: options.scroll ?? true,
    resetOnTouchEnds: options.resetOnTouchEnds ?? false,
    initialValue: options.initialValue ?? { x: 0, y: 0 },
    window: options.window,
  }
}

function resolveWindow(options: MouseInElementOptions): Window | undefined {
  if (options.window)
    return options.window
  return typeof window === 'undefined' ? undefined : window
}

function resolveTargetElement(
  target: MaybeRefOrGetter<HTMLElement | null | undefined> | undefined,
  win: Window | undefined,
): Element | undefined {
  const el = toValue(target)
  if (el)
    return el
  return win?.document.body ?? undefined
}

function extractCoords(type: UseMouseCoordType, event: MouseEvent | Touch): [number, number] | null {
  switch (type) {
    case 'page':
      return [event.pageX, event.pageY]
    case 'client':
      return [event.clientX, event.clientY]
    case 'screen':
      return [event.screenX, event.screenY]
    case 'movement':
      return event instanceof MouseEvent
        ? [event.movementX, event.movementY]
        : null
  }
}

/**
 * Reactive mouse position related to an element.
 *
 * Map from @vueuse/core `useMouseInElement`
 * (`source/vueuse/packages/core/useMouseInElement/`), which tracks the cursor
 * on `window` (via `useMouse`) and reconciles it against the target element's
 * `getClientRects()`: `elementX` / `elementY` are the cursor offset inside the
 * element, `elementPositionX` / `elementPositionY` its top-left corner
 * (`pageXOffset`-corrected for `type: 'page'`), `elementWidth` / `elementHeight`
 * its size, and `isOutside` whether the cursor is inside its bounds
 * (`handleOutside: false` freezes `elementX` / `elementY` while outside). The
 * metrics refresh on `scroll` / `resize`, on `style` / `class` mutations
 * (MutationObserver) and on element resize (ResizeObserver), and `stop()`
 * detaches everything.
 *
 * React divergences:
 * - the Vue refs returned by upstream become a plain object of plain values —
 *   read `x`, `y`, `elementX`, `elementY`, `elementPositionX`,
 *   `elementPositionY`, `elementHeight`, `elementWidth`, `isOutside`
 *   (plus `sourceType` and `stop`) directly off the result;
 * - `target` accepts an element, a React ref object (`RefObject<HTMLElement |
 *   null>`) or a getter — the React analog of upstream's `MaybeElementRef`.
 *   The window/document listeners attach in a mount `useEffect` and are
 *   removed on unmount; the element metrics recompute whenever the resolved
 *   element changes, so a `useRef` target that is `null` during the first
 *   render still starts tracking once React attaches the element;
 * - upstream's `useMouse` composition (`mousemove` / `dragover`, optional
 *   `touchstart` / `touchmove` / `touchend` reset and the page scroll
 *   correction) is inlined in the same effect; `stop()` permanently detaches
 *   every listener and observer of this instance (upstream stops the watch
 *   and the composed listeners too);
 * - SSR-safe: nothing touches `window` or the DOM during render — listeners
 *   attach and the initial metrics compute in effects only.
 *
 * @param target - element, React ref object (`{ current }`) or getter
 *   returning the element to measure the mouse position against
 * @param options - `handleOutside` (default `true`), `windowScroll` /
 *   `windowResize` (default `true`), `type` (default `'page'`), `touch`
 *   (default `true`), `scroll` (default `true`), `resetOnTouchEnds` (default
 *   `false`), `initialValue` and a custom `window` instance
 *
 * @example
 * const target = useRef<HTMLDivElement>(null)
 * const { x, y, elementX, elementY, isOutside } = useMouseInElement(target)
 */
export function useMouseInElement(
  target?: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: MouseInElementOptions = {},
): UseMouseInElementReturn {
  const { initialValue = { x: 0, y: 0 } } = options

  const targetRef = useRef(target)
  const optionsRef = useRef(options)
  targetRef.current = target
  optionsRef.current = options

  const [state, setState] = useState<UseMouseInElementState>(() => ({
    x: initialValue.x,
    y: initialValue.y,
    sourceType: null,
    elementX: 0,
    elementY: 0,
    elementPositionX: 0,
    elementPositionY: 0,
    elementHeight: 0,
    elementWidth: 0,
    isOutside: true,
  }))
  const stateRef = useRef(state)
  // latest cursor position for the event-time metric math (read through refs
  // so the mount-effect listeners never observe stale state)
  const mouseRef = useRef({ x: initialValue.x, y: initialValue.y, sourceType: null as UseMouseSourceType })
  const stoppedRef = useRef(false)
  const previousElementRef = useRef<Element | null | undefined>(undefined)
  const mutationObserverRef = useRef<{ observer: MutationObserver, element: Element } | null>(null)
  const resizeObserverRef = useRef<{ observer: ResizeObserver, element: Element } | null>(null)
  const detachRef = useRef<(() => void) | null>(null)

  // Apply a new state snapshot, skipping renders when nothing actually changed.
  const commit = useCallback((next: UseMouseInElementState) => {
    const prev = stateRef.current
    if (
      prev.x === next.x
      && prev.y === next.y
      && prev.sourceType === next.sourceType
      && prev.elementX === next.elementX
      && prev.elementY === next.elementY
      && prev.elementPositionX === next.elementPositionX
      && prev.elementPositionY === next.elementPositionY
      && prev.elementHeight === next.elementHeight
      && prev.elementWidth === next.elementWidth
      && prev.isOutside === next.isOutside
    ) {
      return
    }
    stateRef.current = next
    setState(next)
  }, [])

  // Recompute the element metrics from the latest cursor position and the
  // target element's current rects (upstream: the `watch([targetRef, x, y])`).
  const update = useCallback(() => {
    if (stoppedRef.current)
      return

    const win = resolveWindow(optionsRef.current)
    if (!win)
      return

    const el = resolveTargetElement(targetRef.current, win)
    if (!el || !(el instanceof Element))
      return

    const { handleOutside, type } = normalizeOptions(optionsRef.current)
    const mouse = mouseRef.current
    const prev = stateRef.current

    let { elementX, elementY } = prev
    let { elementPositionX, elementPositionY, elementHeight, elementWidth, isOutside } = prev

    for (const rect of el.getClientRects()) {
      const { left, top, width, height } = rect

      elementPositionX = left + (type === 'page' ? win.pageXOffset : 0)
      elementPositionY = top + (type === 'page' ? win.pageYOffset : 0)
      elementHeight = height
      elementWidth = width

      const elX = mouse.x - elementPositionX
      const elY = mouse.y - elementPositionY
      isOutside = width === 0 || height === 0
        || elX < 0 || elY < 0
        || elX > width || elY > height

      if (handleOutside || !isOutside) {
        elementX = elX
        elementY = elY
      }

      if (!isOutside)
        break
    }

    commit({
      ...prev,
      x: mouse.x,
      y: mouse.y,
      sourceType: mouse.sourceType,
      elementX,
      elementY,
      elementPositionX,
      elementPositionY,
      elementHeight,
      elementWidth,
      isOutside,
    })
  }, [commit])

  const win = resolveWindow(options)

  // window/document listeners (upstream: `useMouse` + the `scroll`/`resize`
  // listeners + the `mouseleave` handler)
  useEffect(() => {
    if (stoppedRef.current)
      return
    if (!win)
      return

    const opts = normalizeOptions(optionsRef.current)
    const listenerOptions: AddEventListenerOptions = { passive: true }

    let _prevMouseEvent: MouseEvent | null = null
    let _prevScrollX = 0
    let _prevScrollY = 0

    const extractor = (event: MouseEvent | Touch): [number, number] | null =>
      extractCoords(normalizeOptions(optionsRef.current).type, event)

    const mouseHandler = (event: MouseEvent) => {
      const result = extractor(event)
      _prevMouseEvent = event
      if (result) {
        mouseRef.current = {
          x: result[0],
          y: result[1],
          sourceType: 'mouse',
        }
        _prevScrollX = win.scrollX
        _prevScrollY = win.scrollY
      }
      update()
    }

    const touchHandler = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const result = extractor(event.touches[0])
        if (result) {
          mouseRef.current = {
            x: result[0],
            y: result[1],
            sourceType: 'touch',
          }
          update()
        }
      }
    }

    const touchEndReset = () => {
      const { initialValue: initial } = normalizeOptions(optionsRef.current)
      mouseRef.current = { ...mouseRef.current, x: initial.x, y: initial.y }
      update()
    }

    const scrollHandler = () => {
      if (!_prevMouseEvent)
        return
      const pos = extractor(_prevMouseEvent)
      if (_prevMouseEvent instanceof MouseEvent && pos) {
        mouseRef.current = {
          x: pos[0] + win.scrollX - _prevScrollX,
          y: pos[1] + win.scrollY - _prevScrollY,
          sourceType: mouseRef.current.sourceType,
        }
        _prevScrollX = win.scrollX
        _prevScrollY = win.scrollY
        update()
      }
    }

    const mouseLeaveHandler = () => {
      commit({ ...stateRef.current, isOutside: true })
    }

    win.addEventListener('mousemove', mouseHandler, listenerOptions)
    win.addEventListener('dragover', mouseHandler, listenerOptions)
    if (opts.touch && opts.type !== 'movement') {
      win.addEventListener('touchstart', touchHandler, listenerOptions)
      win.addEventListener('touchmove', touchHandler, listenerOptions)
    }
    if (opts.resetOnTouchEnds)
      win.addEventListener('touchend', touchEndReset, listenerOptions)
    if (opts.scroll && opts.type === 'page')
      win.addEventListener('scroll', scrollHandler, listenerOptions)
    if (opts.windowScroll)
      win.addEventListener('scroll', update, { capture: true, passive: true })
    if (opts.windowResize)
      win.addEventListener('resize', update, listenerOptions)
    win.document.addEventListener('mouseleave', mouseLeaveHandler, listenerOptions)

    const detach = () => {
      win.removeEventListener('mousemove', mouseHandler, listenerOptions)
      win.removeEventListener('dragover', mouseHandler, listenerOptions)
      win.removeEventListener('touchstart', touchHandler, listenerOptions)
      win.removeEventListener('touchmove', touchHandler, listenerOptions)
      win.removeEventListener('touchend', touchEndReset, listenerOptions)
      win.removeEventListener('scroll', scrollHandler, listenerOptions)
      win.removeEventListener('scroll', update, { capture: true })
      win.removeEventListener('resize', update, listenerOptions)
      win.document.removeEventListener('mouseleave', mouseLeaveHandler, listenerOptions)
      detachRef.current = null
    }
    detachRef.current = detach

    return detach
  }, [update, commit, win])

  // Element tracking + MutationObserver/ResizeObserver (upstream:
  // `useMutationObserver` + `useResizeObserver`). Runs after every render and
  // re-observes only when the resolved element actually changed.
  useEffect(() => {
    if (stoppedRef.current)
      return

    const element = resolveTargetElement(targetRef.current, win)

    if (element !== previousElementRef.current) {
      previousElementRef.current = element
      if (element)
        update()
    }

    if (win && element && 'MutationObserver' in win) {
      const current = mutationObserverRef.current
      if (!current || current.element !== element) {
        current?.observer.disconnect()
        const observer = new MutationObserver(update)
        observer.observe(element, { attributeFilter: ['style', 'class'] })
        mutationObserverRef.current = { observer, element }
      }
    }
    else if (mutationObserverRef.current) {
      mutationObserverRef.current.observer.disconnect()
      mutationObserverRef.current = null
    }

    if (win && element && 'ResizeObserver' in win) {
      const current = resizeObserverRef.current
      if (!current || current.element !== element) {
        current?.observer.disconnect()
        const observer = new ResizeObserver(update)
        observer.observe(element)
        resizeObserverRef.current = { observer, element }
      }
    }
    else if (resizeObserverRef.current) {
      resizeObserverRef.current.observer.disconnect()
      resizeObserverRef.current = null
    }
  })

  // Disconnect the observers on unmount.
  useEffect(() => () => {
    mutationObserverRef.current?.observer.disconnect()
    mutationObserverRef.current = null
    resizeObserverRef.current?.observer.disconnect()
    resizeObserverRef.current = null
  }, [])

  const stop = useCallback(() => {
    stoppedRef.current = true
    detachRef.current?.()
    detachRef.current = null
    mutationObserverRef.current?.observer.disconnect()
    mutationObserverRef.current = null
    resizeObserverRef.current?.observer.disconnect()
    resizeObserverRef.current = null
  }, [])

  return {
    x: state.x,
    y: state.y,
    sourceType: state.sourceType,
    elementX: state.elementX,
    elementY: state.elementY,
    elementPositionX: state.elementPositionX,
    elementPositionY: state.elementPositionY,
    elementHeight: state.elementHeight,
    elementWidth: state.elementWidth,
    isOutside: state.isOutside,
    stop,
  }
}
