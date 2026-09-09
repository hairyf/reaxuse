import type { RefOrValue } from '@reaxuse/shared'
import { isObject, isRefLike, toArray, toValue } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'

type Arrayable<T> = T | T[]

export type WindowEventName = keyof WindowEventMap
export type DocumentEventName = keyof DocumentEventMap
export type ShadowRootEventName = keyof ShadowRootEventMap

export interface GeneralEventListener<E = Event> {
  (evt: E): void
}

type Fn = () => void

interface InferEventTarget<Events> {
  addEventListener: (event: Events, fn?: any, options?: any) => any
  removeEventListener: (event: Events, fn?: any, options?: any) => any
}

/**
 * Unwrap a listener argument for binding. Unlike `toValue`, a plain function
 * is NOT treated as a getter (a listener is a callable itself — upstream's
 * `RefOrValue` semantics), only ref-like `{ current }` objects are unwrapped.
 */
function unwrapListeners<T extends GeneralEventListener>(listener: RefOrValue<Arrayable<T>>): T[] {
  const value = isRefLike(listener) ? listener.current : listener
  return toArray(value) as T[]
}

function register(
  el: EventTarget,
  event: string,
  listener: any,
  options: boolean | AddEventListenerOptions | undefined,
): () => void {
  el.addEventListener(event, listener, options)
  return () => el.removeEventListener(event, listener, options)
}

function sameValues<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((value, index) => Object.is(value, b[index]))
}

/**
 * Order-insensitive, identity-aware equality for the resolved options — the
 * React equivalent of upstream's reactive comparison. Key order differences
 * must not re-bind (a `JSON.stringify` comparison would), while identity
 * changes of non-plain values (e.g. a new `AbortSignal`) must.
 */
function sameOptions(
  a: boolean | AddEventListenerOptions | undefined,
  b: boolean | AddEventListenerOptions | undefined,
): boolean {
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null)
    return Object.is(a, b)
  if (!isObject(a) || !isObject(b))
    return Object.is(a, b)
  const aKeys = Object.keys(a).sort()
  const bKeys = Object.keys(b).sort()
  if (!sameValues(aKeys, bKeys))
    return false
  return aKeys.every(key => Object.is((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
}

/**
 * Use EventListener with ease. Register using
 * [`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
 * on mounted, and
 * [`removeEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)
 * automatically on unmounted.
 *
 * Map from @vueuse/core `useEventListener`
 * (`source/vueuse/packages/core/useEventListener/`). Registers one or more
 * listeners on one or more targets; the target defaults to `window` when
 * omitted. Events, listeners and targets may be passed as arrays (React
 * `Arrayable`), and the target accepts a plain element, a ref-like
 * `{ current }` object or a React ref (`RefOrValue`).
 *
 * React divergences:
 * - the resolved listeners participate in the re-bind comparison like
 *   upstream's `watchImmediate` — a changed listener (or a ref `current`
 *   holding new listeners) re-registers them, while a stable listener identity
 *   keeps the subscription; only changes to the resolved targets, events,
 *   listeners or options re-bind;
 * - the returned cleanup function detaches the currently registered listeners
 *   (upstream returns a `Fn` that stops the internal watcher); the listeners
 *   are also removed automatically on unmount;
 * - SSR-safe: nothing touches `window` during render — the default window
 *   target only resolves when `window` is defined and binding happens in the
 *   mount effect.
 *
 * @example
 * useEventListener(document, 'visibilitychange', (evt) => {
 *   console.log(evt)
 * })
 *
 * // Listens on window when the target is omitted:
 * useEventListener('resize', (evt) => {
 *   console.log(evt)
 * })
 */
export function useEventListener<E extends keyof WindowEventMap>(
  event: RefOrValue<Arrayable<E>>,
  listener: RefOrValue<Arrayable<(this: Window, ev: WindowEventMap[E]) => any>>,
  options?: RefOrValue<boolean | AddEventListenerOptions>,
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 2: Explicitly Window target
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<E extends keyof WindowEventMap>(
  target: Window,
  event: RefOrValue<Arrayable<E>>,
  listener: RefOrValue<Arrayable<(this: Window, ev: WindowEventMap[E]) => any>>,
  options?: RefOrValue<boolean | AddEventListenerOptions>,
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 3: Explicitly Document target
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<E extends keyof DocumentEventMap>(
  target: Document,
  event: RefOrValue<Arrayable<E>>,
  listener: RefOrValue<Arrayable<(this: Document, ev: DocumentEventMap[E]) => any>>,
  options?: RefOrValue<boolean | AddEventListenerOptions>,
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 4: Explicitly ShadowRoot target
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<E extends keyof ShadowRootEventMap>(
  target: RefOrValue<Arrayable<ShadowRoot> | null | undefined>,
  event: RefOrValue<Arrayable<E>>,
  listener: RefOrValue<Arrayable<(this: ShadowRoot, ev: ShadowRootEventMap[E]) => any>>,
  options?: RefOrValue<boolean | AddEventListenerOptions>,
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 5: Explicitly HTMLElement target
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<E extends keyof HTMLElementEventMap>(
  target: RefOrValue<Arrayable<HTMLElement> | null | undefined>,
  event: RefOrValue<Arrayable<E>>,
  listener: RefOrValue<(this: HTMLElement, ev: HTMLElementEventMap[E]) => any>,
  options?: RefOrValue<boolean | AddEventListenerOptions>,
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 6: Custom event target with event type infer
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<Names extends string, EventType = Event>(
  target: RefOrValue<Arrayable<InferEventTarget<Names>> | null | undefined>,
  event: RefOrValue<Arrayable<Names>>,
  listener: RefOrValue<Arrayable<GeneralEventListener<EventType>>>,
  options?: RefOrValue<boolean | AddEventListenerOptions>,
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 7: Custom event target fallback
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<EventType = Event>(
  target: RefOrValue<Arrayable<EventTarget> | null | undefined>,
  event: RefOrValue<Arrayable<string>>,
  listener: RefOrValue<Arrayable<GeneralEventListener<EventType>>>,
  options?: RefOrValue<boolean | AddEventListenerOptions>,
): Fn

export function useEventListener(
  ...args: any[]
): Fn {
  // distinguish the two call shapes: a (list of) string event name(s) as the
  // first parameter means the window-target overload, anything else is a target
  const firstParamTargets = toArray(toValue(args[0])).filter(e => e != null)
  const isTargetFirst = firstParamTargets.every(e => typeof e !== 'string')

  const eventArg = (isTargetFirst ? args[1] : args[0]) as RefOrValue<Arrayable<string>>
  const listenerArg = (isTargetFirst ? args[2] : args[1]) as RefOrValue<Arrayable<GeneralEventListener>>
  const optionsArg = (isTargetFirst ? args[3] : args[2]) as RefOrValue<boolean | AddEventListenerOptions> | undefined

  const win = typeof window === 'undefined' ? undefined : window

  const resolvedTargets: EventTarget[] = isTargetFirst
    ? toArray(toValue(args[0])).filter((e): e is EventTarget => e != null)
    : (win ? [win] : [])
  const resolvedEvents = toArray(toValue(eventArg)) as string[]
  const resolvedOptions = toValue(optionsArg)
  // resolve the listeners at render time so identity changes participate in the
  // re-bind comparison (upstream `watchImmediate` re-runs on the raw listeners)
  const resolvedListeners = unwrapListeners(listenerArg)

  // re-bind whenever the resolved targets / events / listeners / options change
  // (upstream `watchImmediate`); a new inline listener identity re-binds, a
  // stable one keeps the subscription
  const [bind, setBind] = useState(() => ({
    targets: resolvedTargets,
    events: resolvedEvents,
    options: resolvedOptions,
    listeners: resolvedListeners,
  }))

  if (!sameValues(bind.targets, resolvedTargets)
    || !sameValues(bind.events, resolvedEvents)
    || !sameValues(bind.listeners, resolvedListeners)
    || !sameOptions(bind.options, resolvedOptions)) {
    setBind({
      targets: resolvedTargets,
      events: resolvedEvents,
      options: resolvedOptions,
      listeners: resolvedListeners,
    })
  }

  const cleanupRef = useRef<Fn | null>(null)

  useEffect(() => {
    const { targets, events, options, listeners } = bind
    if (!targets.length || !events.length || !listeners.length)
      return

    // snapshot options so removal uses the same values as registration
    const optionsClone = isObject(options) ? { ...options } : options

    const cleanups = targets.flatMap(el =>
      events.flatMap(event =>
        listeners.map(listener => register(el, event, listener, optionsClone)),
      ),
    )

    cleanupRef.current = () => cleanups.forEach(fn => fn())

    return () => {
      cleanupRef.current = null
      cleanups.forEach(fn => fn())
    }
  }, [bind])

  // manual cleanup: detaches everything currently registered (upstream `Fn`).
  // The next target / events / options change still re-binds.
  const stop = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = null
  }, [])

  return stop
}
