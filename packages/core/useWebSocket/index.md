---
category: Browser
---

# useWebSocket

Reactive [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket) client

## Usage

```tsx
import { useWebSocket } from '@reause/core'

const { status, data, send, open, close, ws } = useWebSocket('ws://websocketurl')
```

### Return Values

| Property | Type                                 | Description                          |
| -------- | ------------------------------------ | ------------------------------------ |
| `data`   | `T \| null`                          | Latest received data                 |
| `status` | `'OPEN' \| 'CONNECTING' \| 'CLOSED'` | Connection status                    |
| `ws`     | `WebSocket \| undefined`             | WebSocket instance                   |
| `send`   | `(data, useBuffer?) => boolean`      | Send data (buffers if not connected) |
| `open`   | `() => void`                         | Open/reconnect the connection        |
| `close`  | `(code?, reason?) => void`           | Close the connection                 |

### Callbacks

```tsx
const { data } = useWebSocket('ws://websocketurl', {
  onConnected(ws) {
    console.log('Connected!')
  },
  onDisconnected(ws, event) {
    console.log('Disconnected!', event.code)
  },
  onError(ws, event) {
    console.error('Error:', event)
  },
  onMessage(ws, event) {
    console.log('Message:', event.data)
  },
})
```

### immediate

Enable by default.

Establish the connection immediately when the hook is called.

### autoConnect

Enable by default.

If the URL changes between renders (plain value or React ref), it will automatically reconnect to the new URL.

### autoClose

Enable by default.

This will call `close()` automatically when the `beforeunload` event is triggered or the component unmounts.

### autoReconnect

Reconnect on errors automatically (disabled by default).

```tsx
import { useWebSocket } from '@reause/core'

const { status, data, close } = useWebSocket('ws://websocketurl', {
  autoReconnect: true,
})
```

Or with more controls over its behavior:

```tsx
import { useWebSocket } from '@reause/core'

const { status, data, close } = useWebSocket('ws://websocketurl', {
  autoReconnect: {
    retries: 3,
    delay: 1000,
    onFailed() {
      alert('Failed to connect WebSocket after 3 retries')
    },
  },
})
```

You can also pass a function to `delay` to calculate the delay based on the number of retries. This is useful for implementing exponential backoff:

```tsx
import { useWebSocket } from '@reause/core'

const { status, data, close } = useWebSocket('ws://websocketurl', {
  autoReconnect: {
    retries: 5,
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    delay: retries => Math.min(1000 * 2 ** (retries - 1), 30000),
  },
})
```

Explicitly calling `close()` won't trigger the auto reconnection.

### heartbeat

It's common practice to send a small message (heartbeat) for every given time passed to keep the connection active. In this function we provide a convenient helper to do it:

```tsx
import { useWebSocket } from '@reause/core'

const { status, data, close } = useWebSocket('ws://websocketurl', {
  heartbeat: true,
})
```

Or with more controls:

```tsx
import { useWebSocket } from '@reause/core'

const { status, data, close } = useWebSocket('ws://websocketurl', {
  heartbeat: {
    message: 'ping',
    scheduler: (cb) => {
      // any timer wiring returning `{ pause, resume }` works
      let id = setInterval(cb, 2000)
      return {
        pause: () => clearInterval(id),
        resume: () => { id = setInterval(cb, 2000) },
      }
    },
    pongTimeout: 1000,
  },
})
```

### Sub-protocols

List of one or more subprotocols to use, in this case SOAP and WAMP.

```tsx
import { useWebSocket } from '@reause/core'

const { status, data, send, open, close } = useWebSocket('ws://websocketurl', {
  protocols: ['soap'], // ['soap', 'wamp']
})
```
