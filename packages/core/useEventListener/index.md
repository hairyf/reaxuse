---
category: Browser
---

# useEventListener

Use EventListener with ease. Register using [`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) on mounted, and [`removeEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) automatically on unmounted — React port of VueUse's [`useEventListener`](https://vueuse.org/core/useEventListener/).

**Mapping:** the listeners are read through a latest-value ref and bound in a `useEffect`
(upstream composes `useEventListener` / `watchImmediate`), which re-registers whenever the resolved
target(s), events or options change and removes them on unmount — so new inline listener identities
never churn the subscription. The target accepts a plain element, a ref-like `{ current }` object or a
getter (`MaybeRefOrGetter`), may be an array, and defaults to `window` when omitted. The return value
is an optional cleanup function that detaches the currently registered listeners (upstream returns a
`Fn` that stops the internal watcher).

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

You can pass a ref (e.g. from `useRef`) as the event target — `useEventListener` will unregister the previous event and register the new one when the resolved target changes:

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

Returns a cleanup function to manually unregister the listeners:

```tsx
const cleanup = useEventListener(document, 'keydown', (e) => {
  console.log(e.key)
})

cleanup() // This will unregister the listeners.
```

Unlike VueUse — where calling the hook outside a component lifecycle (SSR) errors — reaxuse's
`useEventListener` is SSR-safe: nothing touches `window` during render, the default `window` target
only resolves when `window` is defined, and binding happens in the mount effect.

<DemoContainer name="UseEventListener" />

## Type Declarations

```ts
export type WindowEventName = keyof WindowEventMap
export type DocumentEventName = keyof DocumentEventMap
export type ShadowRootEventName = keyof ShadowRootEventMap

export interface GeneralEventListener<E = Event> {
  (evt: E): void
}

export type MaybeRefOrGetter<T> = T | { current: T } | (() => T)

// Overload 1 — omitted target defaults to window:
export function useEventListener<E extends keyof WindowEventMap>(
  event: MaybeRefOrGetter<Arrayable<E>>,
  listener: MaybeRefOrGetter<Arrayable<(this: Window, ev: WindowEventMap[E]) => any>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>,
): (() => void) | undefined

// Overloads 2–5 — explicit Window / Document / ShadowRoot / HTMLElement targets:
export function useEventListener<E extends keyof HTMLElementEventMap>(
  target: MaybeRefOrGetter<Arrayable<HTMLElement> | null | undefined>,
  event: MaybeRefOrGetter<Arrayable<E>>,
  listener: MaybeRefOrGetter<(this: HTMLElement, ev: HTMLElementEventMap[E]) => any>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>,
): (() => void) | undefined

// Overloads 6–7 — custom event targets and fallback:
export function useEventListener<EventType = Event>(
  target: MaybeRefOrGetter<Arrayable<EventTarget> | null | undefined>,
  event: MaybeRefOrGetter<Arrayable<string>>,
  listener: MaybeRefOrGetter<Arrayable<GeneralEventListener<EventType>>>,
  options?: MaybeRefOrGetter<boolean | AddEventListenerOptions>,
): (() => void) | undefined
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useEventListener/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useEventListener/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useEventListener/index.browser.test.ts) (mirrored in `packages/core/src/useEventListener.test.tsx`). No upstream `demo.vue` exists — `demo.tsx` below is written for reaxuse.
- reaxuse: [`packages/core/src/useEventListener.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useEventListener.ts), docs + demo co-located in `packages/core/useEventListener/`

<Contributors name="useEventListener" />
