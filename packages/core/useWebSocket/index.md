---
category: Browser
---

# useWebSocket

Reactive [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket)
client — React port of VueUse's [`useWebSocket`](https://vueuse.org/core/useWebSocket/).

**Mapping:** upstream returns `{ data, status, close, send, open, ws }` with `ShallowRef`s for
`data`/`status`/`ws` → React `useState` values (`data: T | null`, `status: 'OPEN' | 'CONNECTING' |
'CLOSED'`, `ws: WebSocket | undefined`), stable `open`/`close`/`send` callbacks reading the mounted
socket and status through latest-value refs, and the connection opened in a mount `useEffect`
(upstream opens synchronously during setup behind an `if (isClient)` check), then closed on unmount
when `autoClose` is on (upstream: `tryOnScopeDispose`). SSR-safe — the server renders the initial
`CLOSED`/`null`/`undefined` values without ever touching `WebSocket`. The `url` accepts a plain value
or a getter function (upstream: `MaybeRefOrGetter`); with `autoConnect` (default) a URL change
reconnects, mirroring upstream's `watch(urlRef, open)`. `heartbeat.message`/`responseMessage` accept
a plain value or a getter resolved on every tick, and the default heartbeat scheduler is a local
`setInterval`-based `{ pause, resume }` pair (upstream's `useIntervalFn` default is a React hook and
cannot be created lazily) — a custom `scheduler` option returns the same controls.

## Usage

```tsx
import { useWebSocket } from '@reaxuse/core'

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

If the URL changes between renders (plain value or getter), it will automatically reconnect to the new URL.

### autoClose

Enable by default.

This will call `close()` automatically when the `beforeunload` event is triggered or the component unmounts.

### autoReconnect

Reconnect on errors automatically (disabled by default).

```tsx
import { useWebSocket } from '@reaxuse/core'

const { status, data, close } = useWebSocket('ws://websocketurl', {
  autoReconnect: true,
})
```

Or with more controls over its behavior:

```tsx
import { useWebSocket } from '@reaxuse/core'

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
import { useWebSocket } from '@reaxuse/core'

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
import { useWebSocket } from '@reaxuse/core'

const { status, data, close } = useWebSocket('ws://websocketurl', {
  heartbeat: true,
})
```

Or with more controls:

```tsx
import { useWebSocket } from '@reaxuse/core'

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
import { useWebSocket } from '@reaxuse/core'

const { status, data, send, open, close } = useWebSocket('ws://websocketurl', {
  protocols: ['soap'], // ['soap', 'wamp']
})
```

<DemoContainer name="UseWebSocket" />

## Type Declarations

```ts
export type WebSocketStatus = 'OPEN' | 'CONNECTING' | 'CLOSED'
export type WebSocketHeartbeatMessage = string | ArrayBuffer | Blob

export interface UseWebSocketOptions {
  onConnected?: (ws: WebSocket) => void
  onDisconnected?: (ws: WebSocket, event: CloseEvent) => void
  onError?: (ws: WebSocket, event: Event) => void
  onMessage?: (ws: WebSocket, event: MessageEvent) => void
  heartbeat?: boolean | {
    message?: WebSocketHeartbeatMessage | (() => WebSocketHeartbeatMessage)
    responseMessage?: WebSocketHeartbeatMessage | (() => WebSocketHeartbeatMessage)
    pongTimeout?: number
    scheduler?: (fn: () => void) => { pause: () => void, resume: () => void }
  }
  autoReconnect?: boolean | {
    retries?: number | ((retried: number) => boolean)
    delay?: number | ((retries: number) => number)
    onFailed?: () => void
  }
  immediate?: boolean
  autoConnect?: boolean
  autoClose?: boolean
  protocols?: string[]
}

export interface UseWebSocketReturn<T> {
  data: T | null
  status: WebSocketStatus
  close: WebSocket['close']
  open: () => void
  send: (data: string | ArrayBuffer | Blob, useBuffer?: boolean) => boolean
  ws: WebSocket | undefined
}

export function useWebSocket<Data = any>(
  url: string | URL | undefined | (() => string | URL | undefined),
  options: UseWebSocketOptions = {},
): UseWebSocketReturn<Data>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useWebSocket/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWebSocket/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWebSocket/index.test.ts) +
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useWebSocket/index.browser.test.ts) (tests mirrored in `useWebSocket.test.tsx`)
- upstream ships no demo for this function, so the demo below is reaxuse-original
- reaxuse: [`packages/core/src/useWebSocket.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useWebSocket.ts),
  docs + demo co-located in `packages/core/useWebSocket/`

<Contributors name="useWebSocket" />
