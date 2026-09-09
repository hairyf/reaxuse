import { useEffect, useState } from 'react'

/**
 * Pointer device type reported by `PointerEvent.pointerType`.
 */
export type PointerType = 'mouse' | 'touch' | 'pen'

export interface UsePointerState {
  x: number
  y: number
  pointerId: number
  pressure: number
  tiltX: number
  tiltY: number
  width: number
  height: number
  twist: number
  pointerType: PointerType | null
}

export interface UsePointerOptions {
  /**
   * Pointer types that listen to.
   *
   * @default ['mouse', 'touch', 'pen']
   */
  pointerTypes?: PointerType[]

  /**
   * Initial values.
   */
  initialValue?: Partial<UsePointerState>

  /**
   * @default window
   */
  target?: EventTarget | null | undefined
}

export interface UsePointerReturn extends UsePointerState {
  isInside: boolean
}

const defaultState: UsePointerState = {
  x: 0,
  y: 0,
  pointerId: 0,
  pressure: 0,
  tiltX: 0,
  tiltY: 0,
  width: 0,
  height: 0,
  twist: 0,
  pointerType: null,
}

/**
 * React port of VueUse's `usePointer`.
 *
 * Map from @vueuse/core `usePointer`
 * (`source/vueuse/packages/core/usePointer/`), which listens to
 * `pointerdown`/`pointermove`/`pointerup` on the `target` option (default
 * `window`), picks the pointer state from every event, and flips `isInside`
 * back to `false` on `pointerleave`/`pointercancel`. A `pointerTypes` filter
 * skips the state update but still marks `isInside`. Reactive pointer state.
 *
 * React divergences:
 * - the Vue refs returned by upstream become a plain object of plain values —
 *   read `x`, `y`, `pressure`, `pointerType`, ... directly off the result;
 * - upstream's `useEventListener` becomes a self-contained mount `useEffect`
 *   that re-subscribes when `target`/`pointerTypes` change and removes all
 *   listeners on unmount;
 * - `initialValue` is folded into the `useState` initializer, so SSR renders
 *   the defaults (`x: 0`, `y: 0`, ..., `pointerType: null`, `isInside: false`)
 *   without touching `window`.
 *
 * @example
 * const { x, y, pressure, pointerType, isInside } = usePointer()
 */
export function usePointer(options: UsePointerOptions = {}): UsePointerReturn {
  const { pointerTypes, target, initialValue } = options

  const [state, setState] = useState<UsePointerState>(() => ({
    ...defaultState,
    ...initialValue,
  }))
  const [isInside, setIsInside] = useState(false)

  useEffect(() => {
    const instance = target ?? (typeof window === 'undefined' ? undefined : window)
    if (!instance)
      return

    const handler = (event: Event) => {
      setIsInside(true)
      const pointerEvent = event as PointerEvent
      if (pointerTypes && !pointerTypes.includes(pointerEvent.pointerType as PointerType))
        return

      setState({
        x: pointerEvent.x,
        y: pointerEvent.y,
        pointerId: pointerEvent.pointerId,
        pressure: pointerEvent.pressure,
        tiltX: pointerEvent.tiltX,
        tiltY: pointerEvent.tiltY,
        width: pointerEvent.width,
        height: pointerEvent.height,
        twist: pointerEvent.twist,
        pointerType: pointerEvent.pointerType as PointerType,
      })
    }
    const leave = () => setIsInside(false)

    const listenerOptions = { passive: true }
    instance.addEventListener('pointerdown', handler, listenerOptions)
    instance.addEventListener('pointermove', handler, listenerOptions)
    instance.addEventListener('pointerup', handler, listenerOptions)
    instance.addEventListener('pointerleave', leave, listenerOptions)
    instance.addEventListener('pointercancel', leave, listenerOptions)

    return () => {
      instance.removeEventListener('pointerdown', handler)
      instance.removeEventListener('pointermove', handler)
      instance.removeEventListener('pointerup', handler)
      instance.removeEventListener('pointerleave', leave)
      instance.removeEventListener('pointercancel', leave)
    }
  }, [pointerTypes, target])

  return { ...state, isInside }
}
