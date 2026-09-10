---
category: Utilities
---

# useEventBus

A basic event bus

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

Upstream auto-unsubscribes listeners when its effect scope is disposed; React has no scope disposal, so `on` / `once` return an unsubscribe function instead. When a component owns a subscription, unsubscribe from a `useEffect` cleanup:

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

Using `EventBusKey` is the key to bind the event type to the key, similar to upstream's [`InjectionKey`](https://antfu.me/posts/typed-provide-and-inject-in-vue) util.

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
