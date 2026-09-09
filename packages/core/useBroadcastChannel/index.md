---
category: Browser
---

# useBroadcastChannel

Reactive [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel).

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
  isClosed,
  onMessage,
  onMessageError,
} = useBroadcastChannel({ name: 'vueuse-demo-channel' })

// Post the message to the broadcast channel:
post('Hello, VueUse World!')

// Option to close the channel if you wish:
close()
```

`close()` keeps the channel instance (upstream parity) and flips `isClosed` to `true`;
`isClosed` also becomes `true` when the channel fires a native `close` event. Because the
instance is retained, calling `post()` after closing reaches the closed channel and throws the
native `InvalidStateError`, exactly like upstream `BroadcastChannel.postMessage`.

The `window` option (`ConfigurableWindow`) is used for support detection and defaults to the
global `window`, so a channel can be probed against an iframe's or a test environment's window.

## Return Values

| State          | Type                            | Description                                                                                                   |
| -------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| isSupported    | `boolean`                       | Whether the `BroadcastChannel` API is supported (by the configured `window`).                                 |
| channel        | `BroadcastChannel \| undefined` | The current channel instance; `undefined` before the mount effect creates it (SSR), retained after `close()`. |
| data           | `D \| undefined`                | Latest data received via the channel's `message` event.                                                       |
| post           | `(data: P) => void`             | Send a message to the channel. Throws `InvalidStateError` after `close()`.                                    |
| close          | `() => void`                    | Close the channel and set `isClosed` to `true`; the instance is kept.                                         |
| error          | `Event \| null`                 | The latest `messageerror` event, or `null` when none occurred.                                                |
| isClosed       | `boolean`                       | Whether the channel has been closed — `true` after `close()` or a native `close` event.                       |
| onMessage      | `(fn) => { off }`               | Register a callback fired on every `message` event (`useListener` protocol).                                  |
| onMessageError | `(fn) => { off }`               | Register a callback fired on every `messageerror` event (`useListener` protocol).                             |

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
