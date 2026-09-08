---
category: Utilities
---

# useEventBus

A basic event bus — React port of VueUse's [`useEventBus`](https://vueuse.org/core/useEventBus/).

The hook returns a `{ on, once, off, emit, reset }` object mirroring the upstream API. It is a pure factory (no React state or effects), so any number of `useEventBus(key)` call sites sharing the same key share the same bus.

## Usage

```tsx
import { useEventBus } from '@reaxuse/core'

const bus = useEventBus<string>('news')

function listener(event: string) {
  console.log(`news: ${event}`)
}

// listen to an event
const unsubscribe = bus.on(listener)

// fire an event
bus.emit('The Tokyo Olympics has begun')

// unregister the listener
unsubscribe()
// or
bus.off(listener)

// clearing all listeners
bus.reset()
```

Upstream auto-unsubscribes listeners when the Vue effect scope is disposed; React has no scope disposal, so `on` / `once` return an unsubscribe function instead. When a component owns a subscription, unsubscribe from a `useEffect` cleanup:

```tsx
import { useEventBus } from '@reaxuse/core'
import { useEffect } from 'react'

function NewsTicker() {
  const { on, emit } = useEventBus<string>('news')

  useEffect(() => on(event => console.log(`news: ${event}`)), [])

  return <button type="button" onClick={() => emit('The Tokyo Olympics has begun')}>Broadcast</button>
}
```

## TypeScript

Using `EventBusKey` is the key to bind the event type to the key, similar to Vue's [`InjectionKey`](https://antfu.me/posts/typed-provide-and-inject-in-vue) util.

```ts
// fooKey.ts
import type { EventBusKey } from '@reaxuse/core'

export const fooKey: EventBusKey<{ name: 'foo' }> = Symbol('symbol-key')
```

```tsx
import { useEventBus } from '@reaxuse/core'

import { fooKey } from './fooKey'

const bus = useEventBus(fooKey)

bus.on((e) => {
  // `e` will be `{ name: 'foo' }`
})
```

<DemoContainer name="UseEventBus" />

## Type Declarations

```ts
export type EventBusListener<T = unknown, P = any> = (event: T, payload?: P) => void
export type EventBusEvents<T, P = any> = Set<EventBusListener<T, P>>
// eslint-disable-next-line ts/no-wrapper-object-types
export interface EventBusKey<T> extends Symbol {}
export type EventBusIdentifier<T = unknown> = EventBusKey<T> | string | number

export interface UseEventBusReturn<T, P> {
  on: (listener: EventBusListener<T, P>) => () => void
  once: (listener: EventBusListener<T, P>) => () => void
  emit: (event?: T, payload?: P) => void
  off: (listener: EventBusListener<T>) => void
  reset: () => void
}

export function useEventBus<T = unknown, P = any>(key: EventBusIdentifier<T>): UseEventBusReturn<T, P>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useEventBus/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useEventBus/index.ts) (implementation),
  [`internal.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useEventBus/internal.ts) (the `events` registry, inlined in `packages/core/src/useEventBus.ts`),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useEventBus/index.browser.test.ts) (mirrored in `packages/core/src/useEventBus.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useEventBus/demo.vue) (ported to `demo.tsx` below).
- reaxuse: [`packages/core/src/useEventBus.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useEventBus.ts), docs + demo co-located in `packages/core/useEventBus/`

<Contributors name="useEventBus" />
