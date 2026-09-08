---
category: Network
---

# useEventSource

An [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) or [Server-Sent-Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) instance opens a persistent connection to an HTTP server, which sends events in text/event-stream format.

## Mapping

React port of VueUse's [`useEventSource`](https://vueuse.org/core/useEventSource/) — a reactive
wrapper around the browser `EventSource` returning an **object mirror** (`UseEventSourceReturn`)
instead of upstream's shallow-ref object: the members are live values, not refs. The connection
is opened from a mount `useEffect` (upstream opens synchronously during setup behind an
`if (isClient)` check), and closed on unmount (upstream: `tryOnScopeDispose`). SSR-safe — the
server renders the initial `CONNECTING`/`null` values without ever touching `EventSource`.

**React divergences:**

- upstream returns `{ eventSource, event, data, status, error, open, close, lastEventId }` with
  `ShallowRef`s for `eventSource`/`event`/`data`/`status`/`error`/`lastEventId` → this port
  exposes plain `useState` values (`eventSource: EventSource | null`, `data: Data | null`,
  `status: 'CONNECTING' | 'OPEN' | 'CLOSED'`, `error: Event | null`, `lastEventId: string | null`);
- `open`/`close` are stable callbacks reading the mounted EventSource through a latest-value ref;
- `url` accepts a plain value or a React ref (upstream:
  `RefOrValue`); with `autoConnect` (default) a URL change between renders reconnects,
  mirroring upstream's `watch(urlRef, open)`;
- the per-event message listeners (custom `events` array, default `['message']`) are registered
  with the raw `addEventListener` inside the connection effect and cleaned up with the
  EventSource on close/unmount.

## Usage

```tsx
import { useEventSource } from '@reaxuse/core'

const { status, data, error, close } = useEventSource('https://event-source-url')
```

### Return Values

| Property      | Type                                 | Description                             |
| ------------- | ------------------------------------ | --------------------------------------- |
| `data`        | `Data \| null`                       | Latest data received                    |
| `status`      | `'CONNECTING' \| 'OPEN' \| 'CLOSED'` | Connection status                       |
| `event`       | `Events[number] \| null`             | Latest named event                      |
| `error`       | `Event \| null`                      | Current error                           |
| `eventSource` | `EventSource \| null`                | EventSource instance (null when closed) |
| `lastEventId` | `string \| null`                     | Last event ID string                    |
| `open`        | `() => void`                         | Open/reopen the connection              |
| `close`       | `() => void`                         | Close the connection                    |

### Named Events

You can define named events with the second parameter:

```tsx
import { useEventSource } from '@reaxuse/core'

const { event, data } = useEventSource(
  'https://event-source-url',
  ['notice', 'update'],
)
```

### immediate

Enable by default.

Establish the connection immediately when the hook is called.

### autoConnect

Enable by default.

If the URL is provided as a React ref object, when the URL changes the hook will automatically reconnect to the new URL.

### Auto Reconnection on Errors

Reconnect on errors automatically (disabled by default).

```tsx
import { useEventSource } from '@reaxuse/core'

const { status, data, close } = useEventSource(
  'https://event-source-url',
  [],
  {
    autoReconnect: true,
  },
)
```

Or with more controls over its behavior:

```tsx
import { useEventSource } from '@reaxuse/core'

const { status, data, close } = useEventSource(
  'https://event-source-url',
  [],
  {
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        alert('Failed to connect EventSource after 3 retries')
      },
    },
  },
)
```

### Data Serialization

Apply custom transformations to incoming data using a serialization function.

```tsx
import { useEventSource } from '@reaxuse/core'

const { data } = useEventSource(
  'https://event-source-url',
  [],
  {
    serializer: {
      read: rawData => JSON.parse(rawData),
    },
  },
)

// If server sends: '{"name":"John","age":30}'
// data will be: { name: 'John', age: 30 }
```

<DemoContainer name="UseEventSource" />

## Type Declarations

```ts
export type EventSourceStatus = 'CONNECTING' | 'OPEN' | 'CLOSED'

export interface UseEventSourceOptions<Data> extends EventSourceInit {
  autoReconnect?: boolean | {
    retries?: number | (() => boolean)
    delay?: number
    onFailed?: () => void
  }
  immediate?: boolean
  autoConnect?: boolean
  serializer?: {
    read: (v?: string) => Data
  }
}

export interface UseEventSourceReturn<Events extends string[], Data = any> {
  data: Data | null
  status: EventSourceStatus
  event: Events[number] | null
  error: Event | null
  close: () => void
  open: () => void
  eventSource: EventSource | null
  lastEventId: string | null
}

export function useEventSource<Events extends string[], Data = any>(
  url: string | URL | undefined | (() => string | URL | undefined),
  events: Events = [] as unknown as Events,
  options: UseEventSourceOptions<Data> = {},
): UseEventSourceReturn<Events, Data>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useEventSource/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useEventSource/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useEventSource/index.browser.test.ts) (tests mirrored in `useEventSource.test.tsx`),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/core/useEventSource/index.md) (docs)
- upstream ships no demo for this function, so the demo below is reaxuse-original
- reaxuse: [`packages/core/src/useEventSource.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useEventSource.ts),
  docs + demo co-located in `packages/core/useEventSource/`

<Contributors name="useEventSource" />
