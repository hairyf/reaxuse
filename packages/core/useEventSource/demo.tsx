import { useEventSource } from '@reaxuse/core'

export default function UseEventSourceDemo() {
  const { status, data, event, lastEventId, open, close } = useEventSource(
    'https://stream.wikimedia.org/v2/stream/recentchange',
    ['message'],
    {
      autoReconnect: {
        retries: 3,
        delay: 1000,
      },
    },
  )

  const received = data == null
    ? '—'
    : typeof data === 'string'
      ? data
      : String(data)

  return (
    <div>
      <p>
        {'Status: '}
        <strong>{status}</strong>
      </p>
      <p>
        {'Event: '}
        <strong>{event ?? '—'}</strong>
      </p>
      <p>
        {'Last event ID: '}
        <strong>{lastEventId ?? '—'}</strong>
      </p>
      <p>
        {'Last message: '}
        <strong>{received}</strong>
      </p>
      <button onClick={() => open()}>
        Open
      </button>
      {' '}
      <button onClick={() => close()}>
        Close
      </button>
    </div>
  )
}
