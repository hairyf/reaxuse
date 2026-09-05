import { useWatchThrottled } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchThrottledDemo() {
  const [input, setInput] = useState('')
  const [updated, setUpdated] = useState(0)

  useWatchThrottled(input, () => setUpdated(count => count + 1), { throttle: 1000 })

  return (
    <div>
      <input
        type="text"
        value={input}
        placeholder="Try to type anything..."
        onChange={event => setInput(event.target.value)}
      />
      <p>
        Delay is set to 1000ms for this demo.
      </p>
      <p>
        Input:
        {' '}
        <strong>{input}</strong>
      </p>
      <p>
        Times Updated:
        {' '}
        {updated}
      </p>
    </div>
  )
}
