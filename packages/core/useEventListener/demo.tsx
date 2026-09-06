import { useEventListener } from '@reaxuse/core'
import { useRef, useState } from 'react'

export default function UseEventListenerDemo() {
  const target = useRef<HTMLDivElement>(null)
  const [clicks, setClicks] = useState(0)
  const [keyCount, setKeyCount] = useState(0)

  // ref-like element target — the effect binds once React attaches the ref
  useEventListener(target, 'click', () => {
    setClicks(count => count + 1)
  })

  // omitted target defaults to window
  useEventListener('keydown', () => {
    setKeyCount(count => count + 1)
  })

  return (
    <div>
      <div ref={target} className="us-event-listener-target">
        <p>Click me</p>
      </div>
      <p>
        Button clicks:
        {' '}
        {clicks}
      </p>
      <p>
        Keydown events (window):
        {' '}
        {keyCount}
      </p>
    </div>
  )
}
