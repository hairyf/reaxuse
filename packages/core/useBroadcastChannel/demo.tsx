import { useBroadcastChannel } from '@reause/core'
import { useState } from 'react'

export default function UseBroadcastChannelDemo() {
  const [message, setMessage] = useState('')
  const { isSupported, data, post, error } = useBroadcastChannel({ name: 'vueuse-demo-channel' })

  return (
    <div>
      <p>
        {'Supported: '}
        <strong>{String(isSupported)}</strong>
      </p>

      <p>Please open this page in at least two tabs</p>

      {isSupported
        ? (
            <div>
              <form onSubmit={(event) => {
                event.preventDefault()
                post(message)
              }}
              >
                <input value={message} onChange={event => setMessage(event.target.value)} type="text" />
                <button type="submit">
                  Send Message
                </button>
              </form>

              {data
                ? (
                    <p>
                      {'received: '}
                      {String(data)}
                    </p>
                  )
                : null}
              {error
                ? (
                    <p>
                      {'error: '}
                      {String(error)}
                    </p>
                  )
                : null}
            </div>
          )
        : (
            <div>
              Aww, snap! The Broadcast Channel Web API is not supported in your browser.
            </div>
          )}
    </div>
  )
}
