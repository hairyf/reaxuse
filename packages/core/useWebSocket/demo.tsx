import { useWebSocket } from '@reaxuse/core'
import { useState } from 'react'

export default function UseWebSocketDemo() {
  const [input, setInput] = useState('')
  const { status, data, send, open, close } = useWebSocket('wss://echo.websocket.events', {
    autoReconnect: {
      retries: 5,
      delay: 1000,
    },
  })

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
        {'Last message: '}
        <strong>{received}</strong>
      </p>
      <input
        value={input}
        onChange={event => setInput(event.target.value)}
        placeholder="Type a message…"
      />
      {' '}
      <button onClick={() => send(input)}>
        Send
      </button>
      {' '}
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
