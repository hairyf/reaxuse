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
