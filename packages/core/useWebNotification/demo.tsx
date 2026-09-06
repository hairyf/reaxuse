import type { UseWebNotificationOptions } from '@reaxuse/core'
import { useWebNotification } from '@reaxuse/core'

export default function UseWebNotificationDemo() {
  const options: UseWebNotificationOptions = {
    title: 'Hello, world from reaxuse!',
    dir: 'auto',
    lang: 'en',
    renotify: true,
    tag: 'test',
  }

  const { isSupported, show } = useWebNotification(options)

  return (
    <div>
      <p>
        Supported:
        {' '}
        <strong>{isSupported ? 'yes' : 'no'}</strong>
      </p>
      {isSupported
        ? <button onClick={() => show()}>Show Notification</button>
        : <p>The Notification Web API is not supported in your browser.</p>}
    </div>
  )
}
