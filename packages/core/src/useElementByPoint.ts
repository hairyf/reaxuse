import type { RefOrValue } from '@reaxuse/shared'
import type { Pausable } from './useTimeoutPoll'
import { toValue } from '@reaxuse/shared'
import { useCallback, useRef, useState } from 'react'
import { useRafFn } from './useRafFn'
import { useSupported } from './useSupported'

export interface UseElementByPointOptions<Multiple extends boolean = false> {
  /**
   * X coordinate of the point to hit-test
   */
  x: RefOrValue<number>
  /**
   * Y coordinate of the point to hit-test
   */
  y: RefOrValue<number>
  /**
   * When enabled, return every element under the point
   * (`document.elementsFromPoint`) instead of the topmost one
   * (`document.elementFromPoint`)
   *
   * @default false
   */
  multiple?: RefOrValue<Multiple>
  /**
   * Allow a custom `document` instance, e.g. working with iframes or in
   * testing environments (upstream: `ConfigurableDocument`).
   *
   * @default the global `document` on the client, `undefined` during SSR
   */
  document?: Document
  /**
   * Custom scheduler driving the element updates (upstream:
   * `ConfigurableScheduler`). Called during render, so it must follow the
   * Rules of Hooks — pass it consistently across renders, e.g.
   * `scheduler: cb => useRafFn(cb, { fpsLimit: 30 })`.
   *
   * @default useRafFn
   */
  scheduler?: (cb: () => void) => Pausable
}

export interface UseElementByPointReturn<Multiple extends boolean = false> {
  /**
   * Whether `elementFromPoint` (or `elementsFromPoint` when `multiple` is
   * enabled) is available in the current browser. `false` during render and
   * on the server, resolved in a mount effect.
   */
  isSupported: boolean
  /**
   * The element at the given point. `null` before the first tick (and when
   * the point hits nothing).
   */
  element: Multiple extends true ? HTMLElement[] : HTMLElement | null
  /**
   * Whether the scheduler loop is currently active
   */
  isActive: boolean
  /**
   * Pause the element update loop
   */
  pause: () => void
  /**
   * Resume the element update loop
   */
  resume: () => void
}

type ElementByPointElement<M extends boolean> = M extends true ? HTMLElement[] : HTMLElement | null

/**
 * Reactive element by point.
 *
 * Map from @vueuse/core `useElementByPoint`
 * (`source/vueuse/packages/core/useElementByPoint/`), which hit-tests the
 * element under the `x` / `y` point with `document.elementFromPoint` (or
 * `document.elementsFromPoint` when `multiple` is enabled) on every scheduler
 * tick — upstream default `useRafFn`, so the element follows the coordinates
 * live.
 *
 * React divergences:
 * - the Vue `ShallowRef<HTMLElement | HTMLElement[] | null>` return becomes a
 *   plain `element` value read directly off the result object;
 * - the Vue `ComputedRef<boolean>` `isSupported` becomes a plain boolean
 *   evaluated once in the mount effect (SSR-safe: `false` until then);
 * - `x`, `y` and `multiple` accept plain values, ref-like `{ current }`
 *   objects or getters (upstream: `RefOrValue`) and are re-resolved on
 *   every tick through latest-value refs, so e.g. a `useMouse` position
 *   updates the hit element without re-running the hook;
 * - the `document` option is inlined (upstream: `ConfigurableDocument`) and
 *   defaults to the global `document` only on the client, so SSR renders never
 *   touch the DOM;
 * - the `scheduler` option is called during render to compose the update loop
 *   (Rules of Hooks) and defaults to `useRafFn`, mirroring upstream.
 *
 * @see https://vueuse.org/core/useElementByPoint/
 * @param options - UseElementByPointOptions
 *
 * @example
 * const { x, y } = useMouse({ type: 'client' })
 * const { element } = useElementByPoint({ x, y })
 */
export function useElementByPoint<M extends boolean = false>(options: UseElementByPointOptions<M>): UseElementByPointReturn<M> {
  const {
    x,
    y,
    document: documentOption = typeof document === 'undefined' ? undefined : document,
    multiple,
    scheduler = useRafFn,
  } = options

  const isSupported = useSupported(() => {
    if (toValue(multiple))
      return documentOption && 'elementsFromPoint' in documentOption

    return documentOption && 'elementFromPoint' in documentOption
  })

  const [element, setElement] = useState<ElementByPointElement<M>>(null as ElementByPointElement<M>)

  // latest-value refs synced each render so the update callback always reads
  // the newest options (stable identity, no re-subscription on option-only
  // renders)
  const documentRef = useRef<Document | undefined>(documentOption)
  documentRef.current = documentOption
  const xRef = useRef(x)
  xRef.current = x
  const yRef = useRef(y)
  yRef.current = y
  const multipleRef = useRef(multiple)
  multipleRef.current = multiple

  const updateElement = useCallback(() => {
    const doc = documentRef.current
    const pointX = toValue(xRef.current)
    const pointY = toValue(yRef.current)

    if (toValue(multipleRef.current)) {
      const elements = doc?.elementsFromPoint(pointX, pointY) ?? []
      setElement(elements as unknown as ElementByPointElement<M>)
    }
    else {
      const hit = doc?.elementFromPoint(pointX, pointY) ?? null
      setElement(hit as unknown as ElementByPointElement<M>)
    }
  }, [])

  const { isActive, pause, resume } = scheduler(updateElement)

  return {
    isSupported,
    element,
    isActive,
    pause,
    resume,
  }
}
