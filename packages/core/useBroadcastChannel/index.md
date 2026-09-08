---
category: Browser
---

# useBroadcastChannel

Reactive [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel).

Closes a broadcast channel automatically on component unmount.

**Mapping:** upstream keeps `channel`/`data`/`error` in `ShallowRef`s → React `useState` values
(`channel: BroadcastChannel | undefined`, `data: D | undefined`, `error: Event | null`), and the
channel is created in a mount `useEffect` gated by `useSupported` (upstream: a `tryOnMounted` setup
block behind `if (isSupported.value)`) — SSR-safe, the server renders the initial `undefined`/`null`
values without ever touching `BroadcastChannel`. Upstream's internal `useEventListener` message
listeners become the `onMessage` / `onMessageError` registration functions in the return
(`(fn) => { off }`, `useListener` protocol); `data` / `error` are still updated from the same native
listeners. Upstream's `isClosed` flag is dropped: `close()` closes the channel and releases the
reference (`channel` → `undefined`), so a closed channel is observable and `post()` becomes a no-op
after closing.

## Usage

The BroadcastChannel interface represents a named channel that any browsing
context of a given origin can subscribe to. It allows communication between
different documents (in different windows, tabs, frames, or iframes) of the
same origin.

Messages are broadcasted via a message event fired at all BroadcastChannel
objects listening to the channel.

```tsx
import { useBroadcastChannel } from '@reaxuse/core'

const {
  isSupported,
  channel,
  data,
  post,
  close,
  error,
  onMessage,
  onMessageError,
} = useBroadcastChannel({ name: 'vueuse-demo-channel' })

// Post the message to the broadcast channel:
post('Hello, VueUse World!')

// Option to close the channel if you wish:
close()
```

### onMessage / onMessageError

The returned `onMessage` / `onMessageError` are stable registration functions following the
`useListener` protocol — each accepts a callback and returns an `off` handle, so listeners never leak
and never fire after the component unmounts:

```tsx
import { useBroadcastChannel } from '@reaxuse/core'
import { useListener } from '@reaxuse/shared'

const { data, onMessage } = useBroadcastChannel<string, string>({ name: 'my-channel' })

useListener(onMessage, (event) => {
  console.log('Message:', event.data)
})
```

`data` is updated by the same native `message` listener, so you can simply render it directly.

<DemoContainer name="UseBroadcastChannel" />

## Type Declarations

```ts
export interface UseBroadcastChannelOptions extends ConfigurableWindow {
  name: string
}

export interface UseBroadcastChannelReturn<D, P> {
  isSupported: boolean
  channel: BroadcastChannel | undefined
  data: D | undefined
  post: (data: P) => void
  close: () => void
  error: Event | null
  onMessage: (fn: (event: MessageEvent<D>) => void) => { off: () => void }
  onMessageError: (fn: (event: MessageEvent) => void) => { off: () => void }
}

export function useBroadcastChannel<D, P>(options: UseBroadcastChannelOptions): UseBroadcastChannelReturn<D, P>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useBroadcastChannel/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBroadcastChannel/index.ts) (implementation),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBroadcastChannel/index.md) (docs),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useBroadcastChannel/demo.vue) (ported to `demo.tsx` below)
- upstream ships no tests for this function, so `useBroadcastChannel.test.tsx` is reaxuse-authored
- reaxuse: [`packages/core/src/useBroadcastChannel.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useBroadcastChannel.ts), docs + demo co-located in `packages/core/useBroadcastChannel/`

<Contributors name="useBroadcastChannel" />
