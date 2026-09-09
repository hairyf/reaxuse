import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * We have to check if the scroll amount is close enough to some threshold in order to
 * more accurately calculate arrivedState. This is because scrollTop/scrollLeft are non-rounded
 * numbers, while scrollHeight/scrollWidth and clientHeight/clientWidth are rounded.
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_an_element_has_been_totally_scrolled
 */
const ARRIVED_STATE_THRESHOLD_PIXELS = 1

export interface UseWindowScrollOptions {
  /**
   * Initial horizontal scroll position. When provided, the window is
   * scrolled there on mount.
   *
   * @default 0
   */
  x?: number

  /**
   * Initial vertical scroll position. When provided, the window is
   * scrolled there on mount.
   *
   * @default 0
   */
  y?: number

  /**
   * Optionally specify a scroll behavior of `auto` (default, not smooth
   * scrolling) or `smooth` (for smooth scrolling) which takes effect when
   * scrolling with the `setX` / `setY` setters.
   *
   * @default 'auto'
   */
  behavior?: ScrollBehavior

  /**
   * The check time when scrolling ends, in milliseconds. After `idle`
   * milliseconds without scroll events `isScrolling` resets to `false`.
   *
   * @default 200
   */
  idle?: number

  /**
   * Offset the arrived states by x pixels.
   *
   * @default { left: 30, right: 30, top: 30, bottom: 30 }
   */
  offset?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }

  /**
   * On error callback
   *
   * Default log error to `console.error`
   */
  onError?: (error: unknown) => void
}

export interface UseWindowScrollReturn {
  /**
   * Current horizontal scroll position of the window.
   */
  x: number

  /**
   * Current vertical scroll position of the window.
   */
  y: number

  /**
   * Whether the window is scrolling. Resets to `false` after `idle`
   * milliseconds without scroll events.
   */
  isScrolling: boolean

  /**
   * Whether the window is arrived at an edge, within `offset` pixels.
   */
  arrivedState: {
    left: boolean
    right: boolean
    top: boolean
    bottom: boolean
  }

  /**
   * Direction of the last scroll movement per axis.
   */
  directions: {
    left: boolean
    right: boolean
    top: boolean
    bottom: boolean
  }

  /**
   * Scroll the window horizontally to `x`.
   */
  setX: (x: number) => void

  /**
   * Scroll the window vertically to `y`.
   */
  setY: (y: number) => void
}

/**
 * Reactive window scroll.
 *
 * Map from @vueuse/core `useWindowScroll`
 * (`source/vueuse/packages/core/useWindowScroll/`), which delegates to
 * upstream `useScroll(window)`: reactive `x` / `y` scroll position,
 * `isScrolling` with an `idle` timeout, `arrivedState` within `offset`
 * pixels of the edges and per-axis `directions`.
 *
 * React divergences from upstream:
 *
 * 1. Refs → plain state values: upstream returns a writable `computed` for
 *    `x` / `y` and `ShallowRef` / `reactive` objects for the rest; here
 *    every value is React state that updates on re-render. Scroll events
 *    are batched by React, so all values settle together.
 * 2. Writable refs → setter functions: scroll with the `setX` / `setY`
 *    callbacks instead of assigning `x.value`; both are stable
 *    (`useCallback`) and call `window.scrollTo` honoring the `behavior`
 *    option.
 * 3. The `scroll` / `scrollend` listeners (passive, non-capturing per
 *    upstream's `eventListenerOptions` default) are registered inline in a
 *    `useEffect` with cleanup; the idle reset is a plain `setTimeout`
 *    instead of upstream's `useDebounceFn`.
 *
 * @example
 * const { x, y, isScrolling, arrivedState, directions, setX, setY } = useWindowScroll()
 * setY(y + 200) // scroll down 200px more
 */
export function useWindowScroll(options: UseWindowScrollOptions = {}): UseWindowScrollReturn {
  const {
    x: initialX,
    y: initialY,
    behavior = 'auto',
    idle = 200,
    offset,
    onError = (e) => { console.error(e) },
  } = options

  const offsetLeft = offset?.left ?? 30
  const offsetRight = offset?.right ?? 30
  const offsetTop = offset?.top ?? 30
  const offsetBottom = offset?.bottom ?? 30

  const [x, setXState] = useState(initialX ?? 0)
  const [y, setYState] = useState(initialY ?? 0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [arrivedState, setArrivedState] = useState({
    left: true,
    right: false,
    top: true,
    bottom: false,
  })
  const [directions, setDirections] = useState({
    left: false,
    right: false,
    top: false,
    bottom: false,
  })

  // latest-value refs synced each render so the scroll handler, the setters
  // and the effect below always read the newest options without resubscribing
  const internalXRef = useRef(initialX ?? 0)
  const internalYRef = useRef(initialY ?? 0)
  const isScrollingRef = useRef(false)
  const behaviorRef = useRef(behavior)
  const idleRef = useRef(idle)
  const onErrorRef = useRef(onError)
  const offsetRef = useRef({ left: offsetLeft, right: offsetRight, top: offsetTop, bottom: offsetBottom })
  const initialRef = useRef({ x: initialX, y: initialY })
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  behaviorRef.current = behavior
  idleRef.current = idle
  onErrorRef.current = onError
  offsetRef.current = { left: offsetLeft, right: offsetRight, top: offsetTop, bottom: offsetBottom }
  initialRef.current = { x: initialX, y: initialY }

  const measure = useCallback(() => {
    const el = document.documentElement
    const { display, flexDirection, direction } = window.getComputedStyle(el)
    const directionMultiplier = direction === 'rtl' ? -1 : 1

    const scrollLeft = el.scrollLeft
    let scrollTop = el.scrollTop

    // patch for mobile compatible
    if (!scrollTop)
      scrollTop = document.body.scrollTop

    const nextDirections = {
      left: scrollLeft < internalXRef.current,
      right: scrollLeft > internalXRef.current,
      top: scrollTop < internalYRef.current,
      bottom: scrollTop > internalYRef.current,
    }

    const arrivedLeft = Math.abs(scrollLeft * directionMultiplier) <= offsetRef.current.left
    const arrivedRight = Math.abs(scrollLeft * directionMultiplier)
      + el.clientWidth >= el.scrollWidth - offsetRef.current.right - ARRIVED_STATE_THRESHOLD_PIXELS
    const arrivedTop = Math.abs(scrollTop) <= offsetRef.current.top
    const arrivedBottom = Math.abs(scrollTop)
      + el.clientHeight >= el.scrollHeight - offsetRef.current.bottom - ARRIVED_STATE_THRESHOLD_PIXELS

    /**
     * reverse columns and rows behave exactly the other way around,
     * bottom is treated as top and top is treated as the negative version of bottom
     */
    const rowReversed = display === 'flex' && flexDirection === 'row-reverse'
    const columnReversed = display === 'flex' && flexDirection === 'column-reverse'

    setArrivedState({
      left: rowReversed ? arrivedRight : arrivedLeft,
      right: rowReversed ? arrivedLeft : arrivedRight,
      top: columnReversed ? arrivedBottom : arrivedTop,
      bottom: columnReversed ? arrivedTop : arrivedBottom,
    })
    setDirections(nextDirections)

    internalXRef.current = scrollLeft
    internalYRef.current = scrollTop
    setXState(scrollLeft)
    setYState(scrollTop)
  }, [])

  const onScrollEnd = useCallback(() => {
    // dedupe if support native scrollend event
    if (!isScrollingRef.current)
      return

    isScrollingRef.current = false
    setIsScrolling(false)
    setDirections({ left: false, right: false, top: false, bottom: false })
  }, [])

  const setX = useCallback((value: number) => {
    if (typeof window === 'undefined')
      return
    window.scrollTo({ left: value, top: internalYRef.current, behavior: behaviorRef.current })
  }, [])

  const setY = useCallback((value: number) => {
    if (typeof window === 'undefined')
      return
    window.scrollTo({ left: internalXRef.current, top: value, behavior: behaviorRef.current })
  }, [])

  useEffect(() => {
    try {
      // place the window at the initial x / y when provided
      const { x: placeX, y: placeY } = initialRef.current
      if (placeX != null || placeY != null) {
        window.scrollTo({
          left: placeX ?? window.scrollX,
          top: placeY ?? window.scrollY,
          behavior: 'auto',
        })
      }
      // mirror upstream `tryOnMounted`: measure the initial arrived state
      measure()
    }
    catch (e) {
      onErrorRef.current(e)
    }

    const onScroll = () => {
      measure()
      isScrollingRef.current = true
      setIsScrolling(true)
      clearTimeout(scrollEndTimerRef.current)
      scrollEndTimerRef.current = setTimeout(onScrollEnd, idleRef.current)
    }

    const eventListenerOptions: AddEventListenerOptions = { capture: false, passive: true }
    window.addEventListener('scroll', onScroll, eventListenerOptions)
    window.addEventListener('scrollend', onScrollEnd, eventListenerOptions)

    return () => {
      window.removeEventListener('scroll', onScroll, eventListenerOptions)
      window.removeEventListener('scrollend', onScrollEnd, eventListenerOptions)
      clearTimeout(scrollEndTimerRef.current)
    }
  }, [measure, onScrollEnd])

  return {
    x,
    y,
    isScrolling,
    arrivedState,
    directions,
    setX,
    setY,
  }
}
