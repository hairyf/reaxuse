import type { MaybeRefOrGetter } from '@reaxuse/shared'
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
 * `MaybeRef` semantics), only ref-like `{ current }` objects are unwrapped.
 */
function unwrapListeners<T extends GeneralEventListener>(listener: MaybeRefOrGetter<Arrayable<T>>): T[] {
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
 * `{ current }` object or a getter (`MaybeRefOrGetter`).
 *
 * React divergences:
 * - the listeners are read through a latest-value ref, so new inline listener
 *   identities never cause re-subscription — only changes to the resolved
 *   target(s), events or options re-bind the listeners (upstream
 *   `watchImmediate` re-runs on any of them);
 * - the returned value is an optional cleanup function that detaches the
 *   currently registered listeners (upstream returns a `Fn` that stops the
 *   internal watcher); the listeners are also removed automatically on
 *   unmount;
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
// @ts-expect-error - TypeScript gets confused with this and can't infer the correct overload with Parameters<...>
export function useEventListener<E extends keyof WindowEventMap>(
  event: MaybeRefOrGetter<Arrayable<E>>,
  listener: MaybeRefOrGetter<Arrayable<(this: Window, ev: WindowEventMap[E]) => any>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>,
): Fn | undefined

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 2: Explicitly Window target
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<E extends keyof WindowEventMap>(
  target: Window,
  event: MaybeRefOrGetter<Arrayable<E>>,
  listener: MaybeRefOrGetter<Arrayable<(this: Window, ev: WindowEventMap[E]) => any>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>,
): Fn | undefined

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 3: Explicitly Document target
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<E extends keyof DocumentEventMap>(
  target: Document,
  event: MaybeRefOrGetter<Arrayable<E>>,
  listener: MaybeRefOrGetter<Arrayable<(this: Document, ev: DocumentEventMap[E]) => any>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>,
): Fn | undefined

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 4: Explicitly ShadowRoot target
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<E extends keyof ShadowRootEventMap>(
  target: MaybeRefOrGetter<Arrayable<ShadowRoot> | null | undefined>,
  event: MaybeRefOrGetter<Arrayable<E>>,
  listener: MaybeRefOrGetter<Arrayable<(this: ShadowRoot, ev: ShadowRootEventMap[E]) => any>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>,
): Fn | undefined

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 5: Explicitly HTMLElement target
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<E extends keyof HTMLElementEventMap>(
  target: MaybeRefOrGetter<Arrayable<HTMLElement> | null | undefined>,
  event: MaybeRefOrGetter<Arrayable<E>>,
  listener: MaybeRefOrGetter<(this: HTMLElement, ev: HTMLElementEventMap[E]) => any>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>,
): Fn | undefined

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 6: Custom event target with event type infer
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<Names extends string, EventType = Event>(
  target: MaybeRefOrGetter<Arrayable<InferEventTarget<Names>> | null | undefined>,
  event: MaybeRefOrGetter<Arrayable<Names>>,
  listener: MaybeRefOrGetter<Arrayable<GeneralEventListener<EventType>>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>,
): Fn | undefined

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 7: Custom event target fallback
 *
 * @see https://vueuse.org/useEventListener
 */
export function useEventListener<EventType = Event>(
  target: MaybeRefOrGetter<Arrayable<EventTarget> | null | undefined>,
  event: MaybeRefOrGetter<Arrayable<string>>,
  listener: MaybeRefOrGetter<Arrayable<GeneralEventListener<EventType>>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>,
): Fn | undefined

export function useEventListener(
  ...args: Parameters<typeof useEventListener>
): Fn | undefined {
  // distinguish the two call shapes: a (list of) string event name(s) as the
  // first parameter means the window-target overload, anything else is a target
  const firstParamTargets = toArray(toValue(args[0])).filter(e => e != null)
  const isTargetFirst = firstParamTargets.every(e => typeof e !== 'string')

  const eventArg = (isTargetFirst ? args[1] : args[0]) as MaybeRefOrGetter<Arrayable<string>>
  const listenerArg = (isTargetFirst ? args[2] : args[1]) as MaybeRefOrGetter<Arrayable<GeneralEventListener>>
  const optionsArg = (isTargetFirst ? args[3] : args[2]) as MaybeRefOrGetter<boolean | AddEventListenerOptions> | undefined

  const win = typeof window === 'undefined' ? undefined : window

  // latest-value ref so the effect always binds the newest listeners without
  // re-subscribing on renders (upstream keeps them in a reactive ref)
  const listenerRef = useRef(listenerArg)
  listenerRef.current = listenerArg

  const resolvedTargets: EventTarget[] = isTargetFirst
    ? toArray(toValue(args[0])).filter((e): e is EventTarget => e != null)
    : (win ? [win] : [])
  const resolvedEvents = toArray(toValue(eventArg)) as string[]
  const resolvedOptions = toValue(optionsArg)

  // re-bind whenever the resolved targets / events / options change (upstream
  // `watchImmediate`); listeners deliberately stay out of this comparison so
  // inline listener identities never churn the subscription
  const [bind, setBind] = useState(() => ({
    targets: resolvedTargets,
    events: resolvedEvents,
    options: resolvedOptions,
  }))

  if (!sameValues(bind.targets, resolvedTargets)
    || !sameValues(bind.events, resolvedEvents)
    || JSON.stringify(bind.options) !== JSON.stringify(resolvedOptions)) {
    setBind({
      targets: resolvedTargets,
      events: resolvedEvents,
      options: resolvedOptions,
    })
  }

  const cleanupRef = useRef<Fn | null>(null)

  useEffect(() => {
    const { targets, events, options } = bind
    if (!targets.length || !events.length)
      return

    const listeners = unwrapListeners(listenerRef.current)
    if (!listeners.length)
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
