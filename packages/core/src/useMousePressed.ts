import type { ConfigurableWindow, MaybeRefOrGetter } from '@reaxuse/shared'
import type { UseMouseSourceType } from './useMouse'
import { toValue } from '@reaxuse/shared'
import { useEffect, useRef, useState } from 'react'

export interface UseMousePressedOptions extends ConfigurableWindow {
  /**
   * Listen to `touchstart` `touchend` events
   *
   * @default true
   */
  touch?: boolean

  /**
   * Listen to `dragstart` `drop` and `dragend` events
   *
   * @default true
   */
  drag?: boolean

  /**
   * Add event listeners with the `capture` option set to `true`
   * (see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#capture))
   *
   * @default false
   */
  capture?: boolean

  /**
   * Initial values
   *
   * @default false
   */
  initialValue?: boolean

  /**
   * Element target to be capture the click
   */
  target?: MaybeRefOrGetter<EventTarget | null | undefined>

  /**
   * Callback to be called when the mouse is pressed
   *
   * @param event
   */
  onPressed?: (event: MouseEvent | TouchEvent | DragEvent) => void

  /**
   * Callback to be called when the mouse is released
   *
   * @param event
   */
  onReleased?: (event: MouseEvent | TouchEvent | DragEvent) => void
}

export interface UseMousePressedReturn {
  pressed: boolean
  sourceType: UseMouseSourceType
}

/**
 * React port of VueUse's `useMousePressed`.
 *
 * Map from @vueuse/core `useMousePressed`
 * (`source/vueuse/packages/core/useMousePressed/`), which tracks a reactive
 * pressing state — `pressed` flips on `mousedown`/`touchstart` (optionally
 * `dragstart`) on the `target` option (default `window`) and back off on
 * `mouseup`/`mouseleave`/`touchend`/`touchcancel` (optionally `drop`/
 * `dragend`) on `window`, recording the `sourceType` of the press.
 *
 * React divergences:
 *
 * - the Vue `pressed`/`sourceType` shallow refs become plain values in a
 *   `{ pressed, sourceType }` object backed by React state;
 * - upstream's `useEventListener` becomes a self-contained mount `useEffect`
 *   that re-subscribes when `target`/`capture`/`drag`/`touch` change and
 *   removes all listeners on unmount;
 * - `onPressed`/`onReleased` are read through a latest-value ref, so the
 *   listeners always call the newest callbacks without re-binding on renders;
 * - `target` accepts an element, a ref-like `{ current }` object or a getter
 *   (React equivalent of `MaybeRefOrGetter`). It is re-resolved on every
 *   render and the listeners re-bind when the resolved element changes;
 * - SSR-safe: nothing touches `window` during render — the listeners attach
 *   in the mount effect only, and `initialValue` seeds `useState` so SSR
 *   renders the same initial state.
 *
 * @example
 * const { pressed, sourceType } = useMousePressed()
 */
export function useMousePressed(options: UseMousePressedOptions = {}): UseMousePressedReturn {
  const {
    touch = true,
    drag = true,
    capture = false,
    initialValue = false,
    window: win,
  } = options

  const [pressed, setPressed] = useState(initialValue)
  const [sourceType, setSourceType] = useState<UseMouseSourceType>(null)

  // latest-value ref synced each render so the listeners registered in the
  // mount effect always read the newest options (stable handler identities)
  const optionsRef = useRef(options)
  optionsRef.current = options

  // dependency-tracking read: refs populate before effects run, so the first
  // render reports `null` for ref-like targets — the effect below re-resolves
  // fresh and re-binds whenever the resolved element changes
  const trackedTarget = toValue(options.target)

  useEffect(() => {
    const instance = win ?? (typeof window === 'undefined' ? undefined : window)
    if (!instance)
      return

    const target = toValue(optionsRef.current.target) ?? instance
    const listenerOptions: AddEventListenerOptions = { passive: true, capture }

    const onPressed = (srcType: UseMouseSourceType) => (event: MouseEvent | TouchEvent | DragEvent) => {
      setPressed(true)
      setSourceType(srcType)
      optionsRef.current.onPressed?.(event)
    }
    const onReleased = (event: MouseEvent | TouchEvent | DragEvent) => {
      setPressed(false)
      setSourceType(null)
      optionsRef.current.onReleased?.(event)
    }

    const listeners: Array<[EventTarget, string, EventListener]> = [
      [target, 'mousedown', onPressed('mouse') as EventListener],
      [instance, 'mouseleave', onReleased as EventListener],
      [instance, 'mouseup', onReleased as EventListener],
    ]

    if (drag) {
      listeners.push(
        [target, 'dragstart', onPressed('mouse') as EventListener],
        [instance, 'drop', onReleased as EventListener],
        [instance, 'dragend', onReleased as EventListener],
      )
    }

    if (touch) {
      listeners.push(
        [target, 'touchstart', onPressed('touch') as EventListener],
        [instance, 'touchend', onReleased as EventListener],
        [instance, 'touchcancel', onReleased as EventListener],
      )
    }

    listeners.forEach(([el, type, handler]) => el.addEventListener(type, handler, listenerOptions))

    return () => {
      listeners.forEach(([el, type, handler]) => el.removeEventListener(type, handler, listenerOptions))
    }
  }, [trackedTarget, capture, drag, touch, win])

  return { pressed, sourceType }
}
