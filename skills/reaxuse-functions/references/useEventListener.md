---
category: Browser
---

# useEventListener

Use EventListener with ease. Register using [`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) on mounted, and [`removeEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) automatically on unmounted

## Usage

```tsx
import { useEventListener } from '@reaxuse/core'

useEventListener(document, 'visibilitychange', (evt) => {
  console.log(evt)
})
```

### Default Target

When the target is omitted, it defaults to `window`:

```tsx
import { useEventListener } from '@reaxuse/core'

// Listens on window
useEventListener('resize', (evt) => {
  console.log(evt)
})
```

### Reactive Target

You can pass a ref as the event target, `useEventListener` will unregister the previous event and register the new one when the target changes:

```tsx
import { useEventListener } from '@reaxuse/core'
import { useRef } from 'react'

const element = useRef<HTMLDivElement>(null)
useEventListener(element, 'keydown', (e) => {
  console.log(e.key)
})
```

### Multiple Events

You can pass an array of events to listen to multiple events at once:

```tsx
useEventListener(document, ['mouseenter', 'mouseleave'], (evt) => {
  console.log(evt.type)
})
```

### Multiple Targets

You can also pass an array of targets:

```tsx
const buttons = document.querySelectorAll('button')
useEventListener(buttons, 'click', (evt) => {
  console.log('Button clicked')
})
```

### Cleanup

Returns a cleanup function to manually unregister the listener:

```tsx
const cleanup = useEventListener(document, 'keydown', (e) => {
  console.log(e.key)
})

cleanup() // This will unregister the listeners.
```

`useEventListener` is SSR-safe: nothing touches `window` during render, and binding happens in the mount effect.

## Type Declarations

```ts
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
 * - re-binding follows upstream's `watchImmediate` over the resolved targets,
 *   events, listeners and options: a ref-wrapped listener (a `{ current }`
 *   object or React ref) re-registers when its `.current` changes; plain
 *   function listeners are latest-tracked (each render syncs the newest
 *   listener into the subscription), so an inline listener's new identity on
 *   re-render never churns the binding — React cannot compare function
 *   identities across renders without an infinite loop, unlike Vue's reactive
 *   ref comparison;
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
export declare function useEventListener<E extends keyof WindowEventMap>(
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
export declare function useEventListener<E extends keyof WindowEventMap>(
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
export declare function useEventListener<E extends keyof DocumentEventMap>(
  target: Document,
  event: RefOrValue<Arrayable<E>>,
  listener: RefOrValue<
    Arrayable<(this: Document, ev: DocumentEventMap[E]) => any>
  >,
  options?: RefOrValue<boolean | AddEventListenerOptions>,
): Fn
/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 4: Explicitly ShadowRoot target
 *
 * @see https://vueuse.org/useEventListener
 */
export declare function useEventListener<E extends keyof ShadowRootEventMap>(
  target: RefOrValue<Arrayable<ShadowRoot> | null | undefined>,
  event: RefOrValue<Arrayable<E>>,
  listener: RefOrValue<
    Arrayable<(this: ShadowRoot, ev: ShadowRootEventMap[E]) => any>
  >,
  options?: RefOrValue<boolean | AddEventListenerOptions>,
): Fn
/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 5: Explicitly HTMLElement target
 *
 * @see https://vueuse.org/useEventListener
 */
export declare function useEventListener<E extends keyof HTMLElementEventMap>(
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
export declare function useEventListener<
  Names extends string,
  EventType = Event,
>(
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
export declare function useEventListener<EventType = Event>(
  target: RefOrValue<Arrayable<EventTarget> | null | undefined>,
  event: RefOrValue<Arrayable<string>>,
  listener: RefOrValue<Arrayable<GeneralEventListener<EventType>>>,
  options?: RefOrValue<boolean | AddEventListenerOptions>,
): Fn
```
